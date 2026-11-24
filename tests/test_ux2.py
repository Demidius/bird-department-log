# ux2.js: comment field has no scrollbar and grows with the text. Reuses the helpers of test_newui.py.
import pathlib, sys
HERE = pathlib.Path(__file__).resolve().parent
exec((HERE / 'test_newui.py').read_text().split('\nwith sync_playwright()')[0])

with sync_playwright() as pw:
    b = pw.chromium.launch(**CHROME, args=["--no-sandbox"])
    p = page(b)
    p.evaluate("st.rec = D.rec[0].id; st.scr = 'rcard'; render()"); p.wait_for_timeout(300)
    if p.locator('#cin').count():
        print("overflow:", p.evaluate("getComputedStyle(document.getElementById('cin')).overflowY"))
        h0 = p.evaluate("document.getElementById('cin').offsetHeight")
        p.fill('#cin', 'linia\n' * 3 + 'linia'); p.wait_for_timeout(100)
        print("grows:", p.evaluate("document.getElementById('cin').offsetHeight") > h0)
    else:
        print("no comment bar in this setup")
    print("ERRORS:", [e for e in errors if 'fetching the script' not in e])
    b.close()
