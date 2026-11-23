# Clickable prototype of the phone app: the real v2 code (inlined) on the test mock and sample data, in a phone frame,
# with a control strip (screen, language, data, network, theme). Output: one self-contained HTML page.
# Usage: python3 tools/proto_build.py <out.html>
import json, pathlib, re, sys
ROOT = pathlib.Path(__file__).resolve().parent.parent; T = ROOT / 'tests'; SRC = ROOT / 'v2'
OUT = pathlib.Path(sys.argv[1]); OUT.parent.mkdir(parents=True, exist_ok=True)
snap = (ROOT / 'tools' / 'design_snap.py').read_text()
SEED_JS = (T / 'test_newui.py').read_text().split('SEED_JS = """', 1)[1].split('"""', 1)[0]
SAMPLE_JS = snap.split('SAMPLE_JS = """', 1)[1].split('"""', 1)[0].replace('return loadAll().then(render); })()', '})()')
def js(s): return s.replace('</script', '<\\/script')

POLY = "if (!(window.crypto && crypto.randomUUID)) { var c = window.crypto || {}; c.randomUUID = function () { return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (ch) { var r = Math.random() * 16 | 0; return (ch === 'x' ? r : (r & 3 | 8)).toString(16); }); }; }"
app = (SRC / 'index.html').read_text()
app = re.sub(r'<link rel="(manifest|icon)"[^>]*>\n?', '', app)
app = app.replace('<link rel="stylesheet" href="app.css">', '<style>' + (SRC / 'app.css').read_text() + '</style>')
BOOT = """
(function () {
  var P = window.__PROTO || {};
  try { Object.defineProperty(navigator, 'onLine', {get: function () { return !(window.__PROTO || {}).off; }}); } catch (x) {}
  var db = __mock.db, me = __mock.users[0].id;
  db.profiles.push({id: me, login: 'demid', display_name: 'Demid', role: 'admin', active: true, created_at: new Date().toISOString()});
  if (!P.empty) {
    (""" + SEED_JS + """)(""" + json.dumps(json.loads((T / 'seed_v2.json').read_text()), ensure_ascii=False) + """);
    """ + SAMPLE_JS + """;
  }
  try { localStorage.setItem('zoo-log-lang2', P.lang || 'pl'); localStorage.setItem('v2theme', P.theme || 'light'); } catch (x) {}
  var cl = supabase.createClient(), gs = cl.auth.getSession, ready = cl.auth.signInWithPassword({email: 'diomid13a@gmail.com', password: 'secret123'});
  cl.auth.getSession = function () { return ready.then(function () { return gs(); }); };
})();
"""
app = re.sub(r'<script src="https://cdn\.jsdelivr[^>]*></script>', lambda m: '<script>' + POLY + '</script>\n<script>' + js((T / 'mock_supabase.js').read_text()) + '</script>\n<script>' + js(BOOT) + '</script>', app)
app = re.sub(r'<script src="(js/[^"]+\.js)"></script>', lambda m: '<script>' + js((SRC / m.group(1)).read_text()) + '</script>', app)

CTRL = """
// prototype controls: the page around the phone sends commands with postMessage (works across origins)
(function () {
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  async function tap(sel, i) { var el = document.querySelectorAll(sel)[i || 0]; if (el) { el.click(); await wait(160); } return !!el; }
  var GO = {
    now: [['[data-scr=now]']], logs: [['[data-scr=logs]']], cal: [['[data-scr=cal]']], more: [['[data-scr=more]']], add: [['[data-scr=now]'], ['[data-fab]']],
    animal: [['[data-scr=more]'], ['[data-scr=animals]'], ['.scroll [data-ani]', 34]],
    place: [['[data-scr=more]'], ['[data-scr=places]'], ['[data-plc]', 2]],
    weather: [['[data-scr=now]'], ['[data-fab]'], ['[data-menu=free]'], ['[data-fv=kind][data-i="5"]']],
    arrive: [['[data-scr=more]'], ['[data-scr=animals]'], ['[data-arrive]']]
  };
  // language and theme as chosen around the phone (storage may be unavailable in the page's sandbox: keep them in memory too)
  var mem = {}, g0 = store.get, s0 = store.set, P = window.__PROTO || {};
  store.get = function (k) { return k in mem ? mem[k] : g0(k); }; store.set = function (k, v) { mem[k] = v; s0(k, v); };
  store.set('v2theme', P.theme || 'light'); store.set('zoo-log-lang2', P.lang || 'pl'); lang = P.lang || 'pl'; applyTheme(); render();
  addEventListener('message', async function (e) {
    var m = e.data || {}; if (!m.proto) return;
    if (m.cmd === 'go' && GO[m.k]) {
      st.add = null; st.ed = null; st.tmenu = null; st.wmenu = null; st.msheet = ''; st.uform = null; st.cf = ''; render(); await wait(60);
      for (var i = 0; i < GO[m.k].length; i++) { var s = GO[m.k][i]; if (!(await tap(s[0], s[1])) && s[0].indexOf('.scroll') === 0) await tap('.scroll [data-ani]'); }
    }
    if (m.cmd === 'lang') { lang = m.v; store.set('zoo-log-lang2', lang); render(); }
    if (m.cmd === 'theme') { store.set('v2theme', m.v); applyTheme(); render(); }
    if (m.cmd === 'off') { window.__PROTO.off = m.v; dispatchEvent(new Event(m.v ? 'offline' : 'online')); }
  });
})();
"""
app = re.sub(r'<script>if \(\'serviceWorker\'[^<]*</script>\n?', '', app)
app = app.replace('</body>', '<script>' + js(CTRL) + '</script>\n</body>')
app = app.replace('<head>', '<head>\n<script>window.__PROTO = __CFG__;</script>', 1)
assert 'src="js/' not in app and 'cdn.jsdelivr' not in app

TOKENS = '\n'.join((SRC / 'app.css').read_text().split('\n')[1:4])  # light, dark and size tokens

PAGE = """<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Журнал отдела птиц — прототип (сайт 23.11)</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
""" + TOKENS + """
*{box-sizing:border-box}
html,body{margin:0;background:var(--soft);color:var(--ink);font:14px/1.45 var(--font-text)}
.ctl{position:sticky;top:0;z-index:5;display:flex;flex-wrap:wrap;gap:8px 18px;align-items:center;padding:10px 16px;background:var(--card);box-shadow:var(--shadow-card)}
.ctl .grp{display:flex;flex-wrap:wrap;gap:4px;align-items:center}
.ctl b{font:700 11px/1 var(--font-text);letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin-right:4px}
.ctl button{min-height:34px;padding:0 11px;border:1.5px solid var(--ctl-line);border-radius:999px;background:var(--card);color:var(--ink);font:600 13px/1 var(--font-text);cursor:pointer}
.ctl button[aria-pressed=true]{background:var(--ink);border-color:var(--ink);color:var(--bg)}
.ctl button:focus-visible{outline:2px solid var(--ink);outline-offset:2px}
.wrap{display:flex;flex-wrap:wrap;gap:28px;justify-content:center;align-items:flex-start;padding:22px 16px 40px}
#stage{flex:none}
.phone{width:414px;height:868px;padding:12px;border-radius:52px;background:#101512;box-shadow:0 18px 50px rgba(0,0,0,.25);transform-origin:top center}
.phone iframe{display:block;width:390px;height:844px;border:0;border-radius:40px;background:var(--bg)}
.notes{flex:1 1 320px;max-width:460px;font-size:14px;color:var(--ink-2)}
.notes h1{margin:0 0 6px;font:800 22px/1.2 var(--font-display);color:var(--ink)}
.notes h2{margin:18px 0 6px;font:800 15px/1.25 var(--font-display);color:var(--ink)}
.notes p{margin:0 0 8px}.notes ul{margin:0;padding-left:18px}.notes li{margin:0 0 6px}.notes b{color:var(--ink)}
.notes .muted{color:var(--muted);font-size:13px}
@media (max-width:700px){.ctl{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;padding:8px 10px}.ctl .grp{flex-wrap:nowrap;flex:none}.wrap{padding:12px 0 30px}.notes{padding:0 16px}}
.phone.bare{padding:0;border-radius:0;background:none;box-shadow:none}.phone.bare iframe{border-radius:0}
</style>
</head>
<body>
<div class="ctl" role="toolbar" aria-label="Управление прототипом">
 <div class="grp"><b>Экран</b><button data-go="now">Сейчас</button><button data-go="add">+ Запись</button><button data-go="logs">Журнал</button><button data-go="cal">Календарь</button><button data-go="more">Ещё</button><button data-go="animal">Животное</button><button data-go="place">Вольер</button><button data-go="weather">Погода</button><button data-go="arrive">Поступление</button></div>
 <div class="grp"><b>Язык</b><button data-lang="pl">PL</button><button data-lang="ru">RU</button><button data-lang="en">EN</button></div>
 <div class="grp"><b>Данные</b><button data-empty="0">База</button><button data-empty="1">Пусто</button></div>
 <div class="grp"><b>Сеть</b><button data-off="0">Есть</button><button data-off="1">Нет</button></div>
 <div class="grp"><b>Тема</b><button data-th="light">Светлая</button><button data-th="dark">Тёмная</button></div>
 <div class="grp"><button data-reset="1">Сначала</button></div>
</div>
<div class="wrap">
 <div id="stage"><div class="phone" id="phone"><iframe id="app" title="Приложение «Журнал отдела птиц»"></iframe></div></div>
 <div class="notes">
  <h1>Прототип — как сайт сейчас</h1>
  <p>Внутри телефона — настоящий код приложения на тестовых данных отдела: всё нажимается, формы сохраняются, «назад» и переходы работают как на сайте. Записи живут до перезагрузки страницы, в базу ничего не уходит.</p>
  <h2>Что есть на сайте (23.11)</h2>
  <ul>
   <li><b>Сейчас</b> — лечение, наблюдения, задачи отдела; «Подать», оценка 1–5, «Сделано» прямо в карточке.</li>
   <li><b>«+»</b> → животное / вольер / свободная запись → «Что записать?» → форма по типу; несколько животных — общее поле и по каждой особи.</li>
   <li><b>Роды и выклев</b> — родители и кто родился; родители попадают в карточку детёныша.</li>
   <li><b>Вольер</b> — «Указать температуру» и график в карточке (7 / 30 / 90 дней / всё).</li>
   <li><b>Свободная запись → Погода</b> — температура, небо, осадки, ветер, явления.</li>
   <li><b>Группа без точной численности</b> — в поступлении и правке карточки, «примерно сколько».</li>
   <li><b>Комментарии</b> к записям с ответами; править запись может автор и администратор.</li>
   <li><b>Кнопка «обновить»</b> рядом с аккаунтом — данные обновляются сами, кнопка подсвечивается, если новое не загрузилось.</li>
   <li><b>Календарь</b>, <b>журнал</b> с фильтрами, <b>Ещё</b> — животные, вольеры, виды, пропущенные данные, журнал изменений, пользователи, тема и язык.</li>
  </ul>
  <h2>Как пользоваться</h2>
  <p>Кнопки сверху — быстрый переход к экрану и переключатели: язык, пустая база, нет сети, тема. «Сначала» возвращает исходные данные.</p>
  <p class="muted">Замечания пиши в чат по экранам: что убрать, что крупнее, что не так по смыслу.</p>
 </div>
</div>
<script>
const APP = """ + json.dumps(app, ensure_ascii=False).replace('</', '<\\/') + """;
window.__PROTO = {lang: 'pl', theme: 'light', empty: false, off: false};
const fr = document.getElementById('app'), phone = document.getElementById('phone');
// srcdoc, not a blob: URL — it is covered by the page's own policy and needs no extra frame permission
function load() { fr.srcdoc = APP.replace('__CFG__', JSON.stringify(window.__PROTO)); mark(); }
const send = (cmd, extra) => { try { fr.contentWindow.postMessage(Object.assign({proto: 1, cmd}, extra), '*'); } catch (x) {} };
function mark() {
  const P = window.__PROTO;
  document.querySelectorAll('[data-lang]').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === P.lang));
  document.querySelectorAll('[data-th]').forEach(b => b.setAttribute('aria-pressed', b.dataset.th === P.theme));
  document.querySelectorAll('[data-empty]').forEach(b => b.setAttribute('aria-pressed', (b.dataset.empty === '1') === P.empty));
  document.querySelectorAll('[data-off]').forEach(b => b.setAttribute('aria-pressed', (b.dataset.off === '1') === P.off));
  document.documentElement.dataset.theme = P.theme;
}
document.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return; const d = b.dataset, P = window.__PROTO;
  if (d.go) return send('go', {k: d.go});
  if (d.lang) { P.lang = d.lang; send('lang', {v: d.lang}); }
  if (d.th) { P.theme = d.th; send('theme', {v: d.th}); }
  if (d.off) { P.off = d.off === '1'; send('off', {v: P.off}); }
  if (d.empty) { P.empty = d.empty === '1'; load(); }
  if (d.reset) { P.empty = false; P.off = false; load(); }
  mark();
});
function fit() {
  const bare = innerWidth < 500, W0 = bare ? 390 : 414, H0 = bare ? 844 : 868, st = document.getElementById('stage');
  phone.classList.toggle('bare', bare);
  const avail = innerHeight - document.querySelector('.ctl').offsetHeight - (bare ? 0 : 40);
  const s = bare ? Math.min(1, innerWidth / W0) : Math.min(1, Math.max(0.5, Math.min(avail / H0, (innerWidth - 32) / W0)));
  phone.style.transformOrigin = 'top left'; phone.style.transform = s < 1 ? `scale(${s})` : ''; st.style.width = (W0 * s) + 'px'; st.style.height = (H0 * s) + 'px';
}
addEventListener('resize', fit); fit(); load();
</script>
</body>
</html>
"""
OUT.write_text(PAGE)
print(OUT, len(PAGE))
