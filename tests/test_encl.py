import re, pathlib, sys, os
from playwright.sync_api import sync_playwright
HERE = pathlib.Path(__file__).resolve().parent; src = HERE.parent; out = pathlib.Path(sys.argv[1]); out.mkdir(exist_ok=True)
CHROME = {'executable_path': os.environ['CHROME']} if os.environ.get('CHROME') else {}
mock = (HERE / 'mock_supabase.js').read_text()
seed = (HERE / 'seed_species.json').read_text()
html = re.sub(r'<script src="https://cdn\.jsdelivr[^>]*></script>', '<script src="https://zoo.test/mock.js"></script>', (src / 'index.html').read_text())
errors = []

def esc_close(p):
    p.keyboard.press("Escape"); p.wait_for_timeout(120)
    if p.is_visible("#cfm"): p.click("#cfm-ok"); p.wait_for_timeout(150)
def page(b, w, h, pre=None):
    p = b.new_page(viewport={"width": w, "height": h}, locale="ru-RU")
    p.on("pageerror", lambda e: errors.append(str(e)))
    p.on("console", lambda m: m.type == "error" and "ERR_" not in m.text and errors.append(m.text))
    p.route("**/fonts.g*/**", lambda r: r.abort())
    p.route("https://commons.wikimedia.org/**", lambda r: r.abort())
    p.route("https://zoo.test/mock.js", lambda r: r.fulfill(status=200, content_type="text/javascript", body=mock + "\n;window.__seed=" + seed + ";"))
    p.route("https://zoo.test/index.html", lambda r: r.fulfill(status=200, content_type="text/html", body=html))
    p.route("https://zoo.test/desktop.css", lambda r: r.fulfill(status=200, content_type="text/css", body=(src / 'desktop.css').read_text()))
    for fn in ["i18n.js", "i18n-species.js", "pwa.js", "app.js"]:
        body = (src / fn).read_text()
        p.route("https://zoo.test/" + fn, (lambda bb: (lambda r: r.fulfill(status=200, content_type="text/javascript", body=bb)))(body))
    p.goto("https://zoo.test/index.html"); p.wait_for_timeout(400)
    p.evaluate("__mock.db.species.push(...window.__seed)")
    if pre: p.evaluate(pre)
    p.fill("#lg-login", "diomid13a@gmail.com"); p.fill("#lg-pass", "secret123"); p.click("#lg-btn"); p.wait_for_timeout(400)
    if p.is_visible("#claim-btn"): p.click("#claim-btn"); p.wait_for_timeout(600)
    return p

def add_encl(p, name, kind, area="", cap=""):
    p.click("#view-encls [data-encl-new]"); p.wait_for_timeout(150)
    p.fill("#ef-name", name); p.select_option("#ef-kind", value=kind)
    if area: p.fill("#ef-area", area)
    if cap: p.fill("#ef-cap", cap)
    p.click("#ef-save"); p.wait_for_timeout(300)
    p.click("#encl-body .backlink"); p.wait_for_timeout(150)

def add_bird(p, name, sp_label, encl=None):
    p.click(".tab[data-tab=menu]"); p.click("[data-view=coll]"); p.click("#view-coll [data-bird-new]"); p.wait_for_timeout(150)
    p.fill("#bf-name", name); p.select_option("#bf-sp", value=p.evaluate("l => (__mock.db.species.find(s => [s.name_ru, s.name_pl, s.name_en, s.latin].includes(l)) || {}).id", sp_label))
    if encl: p.select_option("#bf-encl", value=encl)
    p.click("#bf-save"); p.wait_for_timeout(300)

with sync_playwright() as pw:
    b = pw.chromium.launch(**CHROME, args=["--no-sandbox"])
    p = page(b, 390, 844)
    p.click(".tab[data-tab=menu]"); p.wait_for_timeout(150)
    print("menu count:", p.inner_text("#encl-count"))
    p.screenshot(path=str(out / "m_menu.png"))
    p.click("[data-view=encls]"); p.wait_for_timeout(200)
    print("empty:", p.inner_text("#encls-body"))
    p.click("#view-encls [data-encl-new]"); p.click("#ef-save"); print("empty name err:", p.inner_text("#ef-err"))
    p.screenshot(path=str(out / "m_form.png"))
    esc_close(p)
    add_encl(p, "Авиарий 1", "aviary", "Тропический павильон", "6")
    add_encl(p, "Клетка К-14", "cage", "Карантинный блок", "1")
    add_encl(p, "Инкубатор №2", "incubator", "Инкубаторная")
    p.click("#view-encls [data-encl-new]"); p.fill("#ef-name", "  авиарий 1 "); p.click("#ef-save"); print("dup err:", p.inner_text("#ef-err")); esc_close(p)
    print("list groups:", p.eval_on_selector_all("#encls-body .day", "e => e.map(x => x.textContent)"), "| chips:", p.inner_text("#ek-chips").replace("\n", " "))

    add_bird(p, "Тукан Рио", "Красногрудый тукан", "Авиарий 1")
    print("bird encl fact:", p.eval_on_selector_all("#bird-body .facts div", "e => e.map(x => x.innerText.replace(/\\n/g, ': ')).filter(t => t.startsWith('Место'))"))
    p.click("#bird-body .facts [data-ec]"); p.wait_for_timeout(200)
    print("encl card:", p.inner_text("#encl-body h1"), "| now:", p.inner_text("#encl-body .nsec .nh"))
    p.click("#encl-body .backlink"); print("back to:", p.eval_on_selector(".view:not([hidden])", "e => e.id"))

    add_bird(p, "Голубь 7", "Изумрудный голубь" if p.evaluate("__seed.some(s => s.name_ru === 'Изумрудный голубь')") else p.evaluate("__seed[3].name_ru"), "Клетка К-14")
    add_bird(p, "Голубь 8", p.evaluate("__seed[3].name_ru"), "Клетка К-14")
    p.click(".tab[data-tab=menu]"); p.click("[data-view=encls]"); p.wait_for_timeout(200)
    print("rows:", p.eval_on_selector_all("#encls-body .row .rt", "e => e.map(x => x.innerText.replace(/\\n/g, ' | '))"))
    p.screenshot(path=str(out / "m_list.png"), full_page=True)

    # move a bird from the cage into the aviary using the card's "Перевести" button
    p.click("#encls-body .row:has-text('Клетка К-14')"); p.wait_for_timeout(200)
    p.screenshot(path=str(out / "m_card_cage.png"), full_page=True)
    p.click("#encl-body .ncard:has-text('Голубь 8') [data-new=expo]"); p.wait_for_timeout(200)
    print("expo prefill from:", p.input_value("#fld-from"), "| to:", p.input_value("#fld-to"))
    p.screenshot(path=str(out / "m_expo.png"))
    p.select_option("#fld-to", value="Авиарий 1"); p.click("#f-save"); p.wait_for_timeout(300)
    print("cage now:", p.locator("#encl-body .nsec").first.locator(".ncard").count(), "| moves:", p.locator("#encl-body .rec").count())

    # "move here" from the aviary + creating a new place from the picker
    p.click("#encl-body .backlink"); p.click("#encls-body .row:has-text('Авиарий 1')"); p.wait_for_timeout(200)
    print("aviary now:", p.eval_on_selector_all("#encl-body .ncard .nl", "e => e.map(x => x.innerText.split('\\n')[0])"), "| facts:", p.eval_on_selector_all("#encl-body .facts div", "e => e.map(x => x.innerText.replace(/\\n/g, ': '))"))
    p.click("#encl-body [data-new=expo][data-to]"); p.wait_for_timeout(200)
    print("move-here to:", p.input_value("#fld-to"))
    print("animal list:", p.eval_on_selector_all("#fld-birdsel option", "e => e.map(x => x.textContent)")); p.select_option("#fld-birdsel", label="Тукан Рио"); p.wait_for_timeout(100)
    print("from after bird pick:", p.input_value("#fld-from"))
    p.select_option("#fld-to", value="__new"); print("new wrap shown:", p.is_visible("#fld-to-new-wrap"))
    p.click("#f-save"); print("new empty err:", p.inner_text("#f-err"))
    p.fill("#fld-to-new", "Зимний вольер"); p.click("#f-save"); p.wait_for_timeout(400)
    print("encls after new:", p.evaluate("__mock.db.enclosures.map(x => x.name + ':' + x.kind)"))
    p.screenshot(path=str(out / "m_card_aviary.png"), full_page=True)

    # rename the cage: animal cards and transfer history follow
    p.click("#encl-body .backlink"); p.click("#encls-body .row:has-text('Клетка К-14')"); p.click("#encl-body [data-encl-edit]"); p.wait_for_timeout(200)
    p.fill("#ef-name", "Клетка К-15"); p.select_option("#ef-state", value="on"); p.click("#ef-save"); p.wait_for_timeout(400)
    print("renamed:", p.inner_text("#encl-body h1"), "| now:", p.eval_on_selector_all("#encl-body .ncard .nl", "e => e.map(x => x.innerText.split('\\n')[0])"))
    print("db coll encl:", p.evaluate("__mock.db.collection.map(x => x.name + '→' + x.encl)"), "| expo:", p.evaluate("__mock.db.records.filter(r => r.type==='expo').map(r => (r.f.from||'') + '→' + r.f.to)"))

    # archive incubator, then delete it
    p.click("#encl-body .backlink"); p.click("#encls-body .row:has-text('Инкубатор')"); p.click("#encl-body [data-encl-edit]"); p.select_option("#ef-state", value="off"); p.click("#ef-save"); p.wait_for_timeout(300)
    p.click("#encl-body .backlink"); print("chips after archive:", p.inner_text("#ek-chips").replace("\n", " "))
    p.click("#ek-chips [data-ek=off]"); print("archived rows:", p.locator("#encls-body .row").count())
    p.click("#encls-body .row"); p.click("#encl-body [data-encl-edit]"); p.click("#ef-del"); print("del armed:", p.inner_text("#ef-del")); p.click("#ef-del"); p.wait_for_timeout(300)
    print("after delete view:", p.eval_on_selector(".view:not([hidden])", "e => e.id"), "| db:", p.evaluate("__mock.db.enclosures.length"))

    # bird form picker shows current place
    p.click(".tab[data-tab=menu]"); p.click("[data-view=coll]"); p.click("#coll-body .row:has-text('Тукан Рио')"); p.wait_for_timeout(200)
    print("toucan place:", p.eval_on_selector_all("#bird-body .facts div", "e => e.map(x => x.innerText.replace(/\\n/g, ': ')).filter(t => t.startsWith('Место'))"))
    p.click("[data-bird-edit]"); p.wait_for_timeout(200); print("bird form encl:", p.input_value("#bf-encl")); esc_close(p)
    p.screenshot(path=str(out / "m_bird.png"), full_page=True)

    # desktop
    d = page(b, 1600, 1000, pre="""() => { const db = __mock.db, me = null; const t = (n,k,a,c) => db.enclosures.push({id: crypto.randomUUID(), name: n, kind: k, area: a, size: '', capacity: c, active: true, note: '', created_by: me, created_at: new Date().toISOString(), updated_at: new Date().toISOString()});
      t('Авиарий 1','aviary','Тропический павильон',6); t('Авиарий 2','aviary','Тропический павильон',null); t('Клетка К-1','cage','Карантин',1); t('Брудер','brooder','Инкубаторная',10); t('Пруд','pond','Улица',null); }""")
    d.click(".tab[data-tab=menu]"); d.click("[data-view=encls]"); d.wait_for_timeout(300)
    d.screenshot(path=str(out / "d_list.png"))
    d.click("#encls-body .row:has-text('Авиарий 1')"); d.wait_for_timeout(200); d.click("[data-encl-edit]"); d.wait_for_timeout(300)
    d.screenshot(path=str(out / "d_form.png"))
    b.close()
print("ERRORS:", errors)
