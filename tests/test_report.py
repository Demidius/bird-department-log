# report.js: species card PDF (preview, print only the document) and journal report for a period. Reuses test_newui.py helpers.
import pathlib, sys
HERE = pathlib.Path(__file__).resolve().parent
exec((HERE / 'test_newui.py').read_text().split('\nwith sync_playwright()')[0])

with sync_playwright() as pw:
    b = pw.chromium.launch(**CHROME, args=["--no-sandbox"])
    p = page(b)
    # species card
    sp = p.evaluate("(() => { const s = [...D.sp.values()].find(x => D.an.some(a => a.species_id === x.id && !a.grp)); s.note = 'Notatka testowa'; spInfo(s).sources = [{t: 'Źródło A', url: 'https://example.org/a'}]; return s.id; })()")
    p.evaluate(f"go({{scr: 'scard', sp: '{sp}'}})"); p.wait_for_timeout(200)
    print("species topbar:", p.evaluate("[...document.querySelectorAll('.cardscr .topbar > *')].map(e => e.dataset.repsp ? 'pdf' : e.dataset.edform ? 'edit' : e.dataset.back ? 'back' : e.tagName)"))
    click(p, '[data-repsp]', t=600); shot(p, 'rep_species')
    t = p.locator('.repv .repdoc').inner_text()
    print("species doc:", p.locator('.repv .repbar b').inner_text(), "|", all(x in t for x in ['Notatka testowa', 'Źródło A', 'W dziale'.upper()[:0] or 'W dziale']), "| rows:", p.locator('.repdoc .rptab.an tr').count())
    p.evaluate("window._printed = 0; window.print = () => { window._printed = [document.body.classList.contains('repp'), document.title, document.getElementById('repprint').innerText.length > 100]; }; 0")
    click(p, '[data-repprint]', t=400); print("print:", p.evaluate("window._printed"))
    p.emulate_media(media="print"); p.evaluate("document.body.classList.add('repp')")
    print("print media shows only the doc:", p.evaluate("[getComputedStyle(document.getElementById('shell')).display, getComputedStyle(document.getElementById('repprint')).display]"))
    p.evaluate("document.body.classList.remove('repp')"); p.emulate_media(media="screen")
    p.go_back(); p.wait_for_timeout(300); print("back closes preview:", p.locator('.repv').count(), p.evaluate("st.scr"))
    # journal report
    click(p, "[data-scr=logs]"); click(p, '[data-repf]', t=300); shot(p, 'rep_form')
    print("form:", p.locator('.repm').count(), p.locator('.repcnt').inner_text())
    click(p, '[data-rq=d30]'); print("30 days:", p.locator('.repcnt').inner_text())
    p.fill('[data-rf=from]', '2026-12-31'); p.locator('[data-rf=from]').dispatch_event('change'); p.wait_for_timeout(150)
    print("bad range:", p.locator('.repcnt').inner_text(), p.locator('[data-repmake]').is_disabled())
    click(p, '[data-rq=d30]'); click(p, '[data-rg=health]'); print("health only:", p.locator('.repcnt').inner_text())
    click(p, '[data-rg=all]'); n = p.evaluate("repList(st.repf).length")
    click(p, '[data-repmake]', t=600); shot(p, 'rep_log')
    print("report:", p.locator('.repv .repbar b').inner_text(), "| records:", p.locator('.repv .repdoc .rprec').count(), "expected", n, "| days:", p.locator('.repv .repdoc .rpday').count())
    p.go_back(); p.wait_for_timeout(200); print("back → form:", p.locator('.repv').count(), p.locator('.repm').count())
    p.go_back(); p.wait_for_timeout(200); print("back → journal:", p.locator('.repm').count(), p.evaluate("st.scr"))
    # computer
    q = page(b, 1360, 800); q.evaluate(f"go({{scr: 'logs'}})"); q.wait_for_timeout(200); click(q, '[data-repf]', t=300); shot(q, 'rep_pc_form')
    click(q, '[data-repmake]', t=600); shot(q, 'rep_pc_log'); print("pc report:", q.locator('.repv .repdoc').count())
    q.evaluate("st.rep = null; st.repf = null; store.set('v2theme', 'dark'); applyTheme()"); q.evaluate("go({scr: 'scard', sp: D.an.find(a => !a.grp).species_id})"); q.wait_for_timeout(200)
    q.locator("[data-repsp]").click(timeout=3000); q.wait_for_timeout(600); shot(q, 'rep_pc_species_dark'); print("pc species:", q.locator('.repv .repdoc').count())
    print("ERRORS:", [e for e in errors if 'fetching the script' not in e])
    b.close()
