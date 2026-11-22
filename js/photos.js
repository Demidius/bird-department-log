// photos.js — photos: signed links, thumbnails, lightbox, photo field in forms
/* ---------- photos: signed links, thumbnails, lightbox ---------- */
const urlCache = new Map();
async function ensureUrls(paths) {
  const now = Date.now(), need = [...new Set(paths)].filter(p => { const c = urlCache.get(p); return !c || c.exp < now + 60e3; });
  for (let i = 0; i < need.length; i += 100) {
    const {data, error} = await sb.storage.from(BUCKET).createSignedUrls(need.slice(i, i + 100), 3600);
    if (error || !data) continue;
    for (const d of data) if (d.signedUrl) urlCache.set(d.path, {url: d.signedUrl, exp: now + 3500e3});
  }
}
function paintPhotos(root = document) {
  if (!sb) return;
  const els = $$('img[data-path]', root).filter(e => !e.getAttribute('src'));
  if (!els.length) return;
  ensureUrls(els.map(e => e.dataset.path)).then(() => els.forEach(e => { const c = urlCache.get(e.dataset.path); if (c) e.src = c.url; })).catch(() => {});
}
const thumbImg = p => `<img data-path="${esc(thumbOf(p.path))}" alt="" loading="lazy">`;
const thumbs = list => {
  if (!list.length) return '';
  const more = list.length - 3;
  return `<span class="thumbs">${list.slice(0, 3).map(thumbImg).join('')}${more > 0 ? `<span class="more">+${more}</span>` : ''}</span>`;
};
const gallery = list => list.length ? `<div class="pgrid gallery">${list.map(p => `<div class="ph"><button type="button" class="ph-open" data-lb="${esc(p.path)}" aria-label="${esc(t('open_photo'))}">${thumbImg(p)}</button></div>`).join('')}</div>` : '';
function openLightbox(path) {
  const lb = $('#lightbox'), img = $('#lb-img');
  img.removeAttribute('src'); img.dataset.path = path;
  lb.hidden = false;
  const c = urlCache.get(path);
  if (c && c.exp > Date.now()) img.src = c.url; else paintPhotos(lb);
  setTimeout(() => $('[data-lb-close]').focus({preventScroll: true}), 30);
}
const closeLightbox = () => { $('#lightbox').hidden = true; $('#lb-img').removeAttribute('src'); };

async function shrink(file, max, quality) {
  let src = null;
  try { src = await createImageBitmap(file, {imageOrientation: 'from-image'}); }
  catch (x) {
    src = await new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = URL.createObjectURL(file); });
  }
  const w0 = src.width || src.naturalWidth, h0 = src.height || src.naturalHeight, k = Math.min(1, max / Math.max(w0, h0));
  const w = Math.max(1, Math.round(w0 * k)), h = Math.max(1, Math.round(h0 * k));
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  c.getContext('2d').drawImage(src, 0, 0, w, h);
  const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', quality));
  if (!blob) throw new Error('encode');
  return {blob, w, h};
}

// a photo field inside a form: existing photos, new ones waiting to be uploaded, removals
// opts (species only): main = id of the main photo or 'wiki'; wiki() = current Wikipedia photo; onWikiRm(); lockMain() = main photo is protected
function photoBox(boxId, ownerType, ownerId, editable, opts) {
  const box = $('#' + boxId), o = opts || null;
  const st2 = {ownerType, ownerId, keep: ownerId ? photosOf(ownerType, ownerId).slice() : [], removed: [], added: [], busy: 0, main: o ? o.main || '' : ''};
  const star = id => {
    if (!o) return '';
    const on = mainOf(st2, o.wiki()) === id, can = editable && !o.lockMain();
    return on ? `<span class="ph-star on" title="${esc(t('ph_is_main'))}">${ic('star', 16, 2.2)}</span>`
      : can ? `<button type="button" class="ph-star" data-star="${esc(id)}" aria-label="${esc(t('ph_main'))}" title="${esc(t('ph_main'))}">${ic('star', 16, 2.2)}</button>` : '';
  };
  const draw = () => {
    const wk = o && o.wiki(), show = editable || st2.keep.length || wk;
    box.hidden = !show;
    if (!show) { box.innerHTML = ''; return; }
    box.innerHTML = `<span class="lbl">${esc(o ? t('ph_all') : t('photos'))}</span><div class="pgrid">`
      + (wk ? `<div class="ph"><button type="button" class="ph-open" data-lbu="${esc(wk.src)}" aria-label="${esc(t('open_photo'))}"><img src="${esc(wk.thumb || wk.src)}" alt=""></button><span class="ph-tag">${esc(t('ph_wiki'))}</span>${star('wiki')}${editable && !o.lockMain() ? `<button type="button" class="ph-x" data-rmw aria-label="${esc(t('ph_wiki_rm'))}">${ic('x', 18, 2.4)}</button>` : ''}</div>` : '')
      + st2.keep.map(p => `<div class="ph"><button type="button" class="ph-open" data-lb="${esc(p.path)}" aria-label="${esc(t('open_photo'))}">${thumbImg(p)}</button>${star(p.id)}${editable && canRmPhoto(p) && !(o && o.lockMain() && mainOf(st2, wk) === p.id) ? `<button type="button" class="ph-x" data-rmk="${esc(p.id)}" aria-label="${esc(t('rm_photo'))}">${ic('x', 18, 2.4)}</button>` : ''}</div>`).join('')
      + st2.added.map(a => `<div class="ph"><img src="${a.url}" alt="">${star(a.id)}<button type="button" class="ph-x" data-rma="${a.key}" aria-label="${esc(t('rm_photo'))}">${ic('x', 18, 2.4)}</button></div>`).join('')
      + (editable ? `<label class="ph-add"><input class="vh" type="file" accept="image/*" multiple>${ic('plus', 22, 2.2)}<span>${esc(t('add_photo'))}</span></label>` : '')
      + `</div>`;
    paintPhotos(box);
  };
  st2.redraw = draw;
  box.onclick = e => {
    const k = e.target.closest('[data-rmk]'), a = e.target.closest('[data-rma]'), sr = e.target.closest('[data-star]'), rw = e.target.closest('[data-rmw]');
    if (sr) { e.preventDefault(); st2.main = sr.dataset.star; draw(); }
    else if (rw) { if (st2.main === 'wiki') st2.main = ''; o.onWikiRm(); draw(); }
    else if (k) { const i = st2.keep.findIndex(p => p.id === k.dataset.rmk); if (i >= 0) st2.removed.push(st2.keep.splice(i, 1)[0]); draw(); }
    else if (a) { const i = st2.added.findIndex(x => x.key === a.dataset.rma); if (i >= 0) { URL.revokeObjectURL(st2.added[i].url); st2.added.splice(i, 1); } draw(); }
  };
  box.onchange = async e => {
    const inp = e.target.closest('input[type=file]');
    if (!inp || !inp.files || !inp.files.length) return;
    const files = [...inp.files];
    for (const f of files) {
      st2.busy++;
      try {
        const full = await shrink(f, 1600, 0.82), th = await shrink(full.blob, 360, 0.78);
        st2.added.push({key: uuid(), id: uuid(), full: full.blob, thumb: th.blob, w: full.w, h: full.h, url: URL.createObjectURL(th.blob)});
      } catch (x) { toast(t('e_photo_read')); }
      finally { st2.busy--; }
    }
    draw();
  };
  draw();
  return st2;
}
async function commitPhotos(st2, ownerId) {
  if (!st2) return 0;
  let failed = 0;
  for (const p of st2.removed) {
    try { await sb.storage.from(BUCKET).remove([p.path, thumbOf(p.path)]); must(await sb.from('photos').delete().eq('id', p.id)); photos = photos.filter(x => x.id !== p.id); }
    catch (x) { failed++; }
  }
  for (const a of st2.added) {
    try {
      const id = a.id || uuid(), path = me + '/' + id + '.jpg';
      must(await sb.storage.from(BUCKET).upload(path, a.full, {contentType: 'image/jpeg', upsert: false}));
      must(await sb.storage.from(BUCKET).upload(thumbOf(path), a.thumb, {contentType: 'image/jpeg', upsert: false}));
      const row = must(await sb.from('photos').insert({id, owner_type: st2.ownerType, owner_id: ownerId, path, width: a.w, height: a.h, created_by: me}).select().single());
      photos.push(fromPhoto(row));
      urlCache.set(thumbOf(path), {url: a.url, exp: Date.now() + 3600e3});
    } catch (x) { failed++; }
  }
  st2.added = []; st2.removed = [];
  return failed;
}
async function dropPhotosOf(type, id) {
  const list = photosOf(type, id).filter(canRmPhoto);
  if (!list.length) return;
  try { await sb.storage.from(BUCKET).remove(list.flatMap(p => [p.path, thumbOf(p.path)])); } catch (x) {}
}
