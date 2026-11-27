# qrcard.js: QR code of the animal card — button, window, PNG, share fallback, link ?a=<id> opens the card after sign-in.
import pathlib, sys, re as _re
HERE = pathlib.Path(__file__).resolve().parent
exec((HERE / 'test_newui.py').read_text().split('\nwith sync_playwright()')[0])

with sync_playwright() as pw:
    b = pw.chromium.launch(**CHROME, args=["--no-sandbox"])
    p = page(b)
    a0 = p.evaluate("D.an.find(a => !a.grp && a.ring) ? D.an.find(a => !a.grp && a.ring).id : D.an[3].id")
    p.evaluate(f"go({{scr: 'card', ani: '{a0}'}})"); p.wait_for_timeout(200)
    print("buttons in topbar:", p.evaluate("[...document.querySelectorAll('.cardscr .topbar > *')].map(e => e.dataset.qr ? 'qr' : e.dataset.edform ? 'edit' : e.dataset.back ? 'back' : e.tagName)"))
    click(p, '[data-qr]', t=300); shot(p, 'qr_sheet')
    print("sheet:", p.locator('.qrsh .qrsvg').count(), p.locator('.qrlab').inner_text().replace(chr(10), ' | '))
    print("url:", p.evaluate(f"qrUrl(anById('{a0}'))"))
    print("png:", p.evaluate(f"(() => {{ const c = qrCanvas(anById('{a0}')); return [c.width, c.height]; }})()"))
    p.evaluate("navigator.share = undefined; navigator.canShare = undefined")
    p.context.grant_permissions(['clipboard-read', 'clipboard-write'], origin='https://zoo.test')
    click(p, '[data-qrdo=sh]', t=300); print("share fallback:", p.evaluate("navigator.clipboard.readText()"), "|", p.locator('#toast').inner_text())
    with p.expect_download() as dl: click(p, '[data-qrdo=dl]', t=300)
    print("download:", dl.value.suggested_filename)
    p.go_back(); p.wait_for_timeout(300); print("back closes sheet:", p.locator('.qrsh').count(), "| still card:", p.evaluate("st.scr"))
    click(p, '[data-qr]', t=200); click(p, '.qrsh [data-qrclose]', t=200); print("x closes:", p.locator('.qrsh').count())
    # dark theme and computer
    p.evaluate("store.set('v2theme', 'dark'); applyTheme(); st.qr = st.ani; render()"); p.wait_for_timeout(200); shot(p, 'qr_dark')
    q = page(b, 1360, 800)
    q.evaluate("go({scr: 'card', ani: D.an[3].id})"); q.wait_for_timeout(300); click(q, '.pc-det [data-qr]', t=300); shot(q, 'qr_pc')
    print("pc sheet:", q.locator('.qrsh .qrsvg').count())
    # deep link: fresh page with ?a=<id>, sign in → the card opens
    r = b.new_page(viewport={"width": 390, "height": 844}, locale="pl-PL")
    r.on("pageerror", lambda e: errors.append(str(e)))
    r.route("**/fonts.g*/**", lambda x: x.abort())
    r.route(_re.compile(r"https://zoo\.test/v2/(\?.*)?$"), lambda x: x.fulfill(status=200, content_type="text/html", body=html))
    r.route("https://zoo.test/mock.js", lambda x: x.fulfill(status=200, content_type="text/javascript", body=mock))
    r.route("https://zoo.test/v2/app.css", lambda x: x.fulfill(status=200, content_type="text/css", body=(src / 'app.css').read_text()))
    for fn in _re.findall(r'<script src="(js/[^"]+\.js)"></script>', html):
        body = (src / fn).read_text()
        r.route("https://zoo.test/v2/" + fn, (lambda bb: (lambda x: x.fulfill(status=200, content_type="text/javascript", body=bb)))(body))
    ID = '11111111-2222-4333-8444-555555555555'
    r.goto("https://zoo.test/v2/?a=" + ID); r.wait_for_timeout(300)
    print("param stripped:", r.evaluate("location.search === ''"))
    r.evaluate(SEED_JS + "(" + json.dumps(seed) + ")"); nm = r.evaluate(f"(() => {{ const a = __mock.db.collection[7]; a.id = '{ID}'; return a.name; }})()")
    r.fill("#lgl", "diomid13a@gmail.com"); r.fill("#lgp", "secret123"); r.click("#loginf button[type=submit]"); r.wait_for_timeout(500)
    if r.is_visible("[data-claim]"): r.click("[data-claim]"); r.wait_for_timeout(700)
    print("deep link:", r.evaluate("[st.scr, (anById(st.ani) || {}).name]"), "expected", nm)
    r.go_back(); r.wait_for_timeout(300); print("back from it:", r.evaluate("st.scr"))
    print("ERRORS:", [e for e in errors if 'fetching the script' not in e])
    b.close()
