# ux.js 11: loading screen — birds circling the logo, «Loading» with dots. Reuses the helpers of test_newui.py.
import pathlib, sys
HERE = pathlib.Path(__file__).resolve().parent
exec((HERE / 'test_newui.py').read_text().split('\nwith sync_playwright()')[0])

with sync_playwright() as pw:
    b = pw.chromium.launch(**CHROME, args=["--no-sandbox"])
    p = page(b)
    p.evaluate("document.getElementById('app').innerHTML = loginScreen('loading')"); p.wait_for_timeout(400)
    print("birds:", p.locator('.lgload .ring .ob svg').count(), "| logo:", p.locator('.lgload .lglogo').count(), "| text:", p.locator('.lgload p').inner_text())
    print("spinning:", p.evaluate("getComputedStyle(document.querySelector('.ring')).animationName"))
    shot(p, "l1_loading")
    print("ERRORS:", [e for e in errors if 'fetching the script' not in e])
    b.close()
