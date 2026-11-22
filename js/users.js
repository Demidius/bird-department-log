// users.js — staff accounts (admin)
/* ---------- staff accounts (admin) ---------- */
function openUserForm(p) {
  if (!isAdmin()) return;
  editingUser = p || null;
  $('#uf-title').textContent = p ? (p.display_name || p.login) : t('uf_new');
  $('#uf-sub').textContent = p ? t('uf_edit') : t('uf_hint');
  const opt = (val, cur, label) => `<option value="${val}"${val === cur ? ' selected' : ''}>${esc(label)}</option>`;
  const roleSel = `<div class="fld"><label for="uf-role">${esc(t('uf_role'))}</label><select id="uf-role" name="role">${['staff', 'viewer', 'admin'].map(r => opt(r, p ? p.role : 'staff', cap(roleText(r)))).join('')}</select></div>`;
  $('#uf-fields').innerHTML = field({k: 'name', l: 'uf_name', t: 'text', req: 1, id: 'uf-name'}, p ? p.display_name : '')
    + field({k: 'login', l: 'uf_login', t: 'text', req: !p, id: 'uf-login', dis: !!p, ac: 'off'}, p ? p.login : '')
    + (p ? '' : `<p class="hint">${esc(t('uf_login_hint'))}</p>`)
    + field({k: 'password', l: p ? 'uf_newpass' : 'uf_pass', t: 'text', req: !p, id: 'uf-pass', ac: 'new-password'}, '')
    + roleSel
    + (p ? `<div class="fld"><label for="uf-state">${esc(t('uf_state'))}</label><select id="uf-state" name="state">${opt('on', p.active ? 'on' : 'off', t('st_on'))}${opt('off', p.active ? 'on' : 'off', t('st_off'))}</select></div>` : '');
  $('#uf-err').textContent = '';
  openSheet('user');
}
$('#user-form').addEventListener('submit', async e => {
  e.preventDefault();
  const err = m => { $('#uf-err').textContent = m; }, g = id => ($('#' + id) ? $('#' + id).value.trim() : '');
  const name = g('uf-name'), login = g('uf-login').toLowerCase(), pass = $('#uf-pass').value, roleV = g('uf-role');
  if (!name) return err(t('e_name_req'));
  if (!editingUser && !/^[a-z0-9._-]{2,32}$/.test(login)) return err(t('e_bad_login'));
  if ((!editingUser || pass) && pass.length < 8) return err(t('e_short_pass'));
  await withBusy($('#uf-save'), async () => {
    try {
      if (editingUser) {
        const body = {action: 'update', id: editingUser.id, display_name: name, role: roleV, active: g('uf-state') !== 'off'};
        if (pass) body.password = pass;
        await callAdmin(body);
      } else {
        await callAdmin({action: 'create', login, password: pass, display_name: name, role: roleV});
      }
      await LOADERS.profiles();
      closeSheets(); render();
      toast(editingUser ? t('t_user_saved') : t('t_user_added'));
    } catch (x) { err(adminErr(x)); }
  });
});

$('#pass-form').addEventListener('submit', async e => {
  e.preventDefault();
  const err = m => { $('#pf-err').textContent = m; }, a = $('#pf-new').value, b = $('#pf-rep').value;
  if (a.length < 8) return err(t('e_short_pass'));
  if (a !== b) return err(t('e_pass_match'));
  await withBusy($('#pf-save'), async () => {
    const {error} = await sb.auth.updateUser({password: a});
    if (error) return err(/different|same/i.test(error.message || '') ? t('e_save') : errMsg(error));
    $('#pf-new').value = ''; $('#pf-rep').value = '';
    closeSheets(); toast(t('t_pass_changed'));
  });
});
