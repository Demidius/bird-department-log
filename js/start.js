// start.js — start-up: language buttons, first paint, Supabase client
/* ---------- start ---------- */
// language buttons and species name fields in the order Polish, English, Russian
[...new Set($$('[data-lang]').map(b => b.parentElement))].forEach(box => LANG_ORDER.forEach(l => { const b = $(`[data-lang=${l}]`, box); if (b) box.appendChild(b); }));
{ const f = id => $('#' + id) && $('#' + id).closest('.fld'), ru = f('sp-name'); if (ru) { ru.before(f('sp-pl')); ru.before(f('sp-en')); } }
paintIcons(document);
$('#today').textContent = new Date().getDate();
applyStatic();
setStatus('', 'info');
if (!window.supabase || !window.supabase.createClient) {
  gate('loading', 'e_lib');
} else {
  sb = window.supabase.createClient(SB_URL, SB_KEY, {auth: {persistSession: true, autoRefreshToken: true, detectSessionInUrl: false}});
  sb.auth.onAuthStateChange(ev => { if (ev === 'SIGNED_OUT') { resetState(); closeSheets(); gate('login'); } });
  boot();
}
