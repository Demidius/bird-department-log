import re, pathlib, sys
exec(open(pathlib.Path(__file__).resolve().parent / 'test_encl.py').read().split("with sync_playwright() as pw:")[0])
with sync_playwright() as pw:
    b = pw.chromium.launch(**CHROME, args=["--no-sandbox"])
    p = page(b, 390, 844)
    # untouched form closes at once
    p.click(".tab[data-tab=menu]"); p.click("[data-view=coll]"); p.click("#view-coll [data-bird-new]"); p.wait_for_timeout(150)
    p.click("#sheet-bird .x"); p.wait_for_timeout(250)
    print("clean close: sheet open?", p.locator(".sheet.open").count(), "| ask shown?", p.is_visible("#cfm"))
    # typed something: asks; Stay keeps it, then confirm closes
    p.click("#view-coll [data-bird-new]"); p.wait_for_timeout(150); p.fill("#bf-name", "Test")
    p.click("#sheet-bird .x"); p.wait_for_timeout(150)
    print("dirty close asks:", p.is_visible("#cfm"), "|", p.inner_text("#cfm-t"))
    p.screenshot(path=str(out)+"/cf_leave.png")
    p.click("#cfm-no"); p.wait_for_timeout(150); print("after Stay: sheet open?", p.locator(".sheet.open").count(), "| value kept:", p.input_value("#bf-name"))
    p.keyboard.press("Escape"); p.wait_for_timeout(150); print("Escape asks:", p.is_visible("#cfm"))
    p.click("#cfm-ok"); p.wait_for_timeout(250); print("after confirm: sheet open?", p.locator(".sheet.open").count())
    # saving does not ask
    p.click("#view-coll [data-bird-new]"); p.wait_for_timeout(150); p.fill("#bf-name", "Kuba"); p.select_option("#bf-sp", index=1); p.click("#bf-save"); p.wait_for_timeout(400)
    print("saved without asking:", not p.is_visible("#cfm"), "| h1:", p.inner_text("#bird-body h1"))
    # logout asks
    p.click(".tab[data-tab=menu]"); p.click("#view-menu [data-logout]"); p.wait_for_timeout(150)
    print("logout asks:", p.is_visible("#cfm"), "|", p.inner_text("#cfm-t")); p.screenshot(path=str(out)+"/cf_logout.png")
    p.click("#cfm-no"); p.wait_for_timeout(200); print("cancel: still in app?", not p.is_visible("#gate"))
    p.click("#view-menu [data-logout]"); p.click("#cfm-ok"); p.wait_for_timeout(400); print("confirm: login shown?", p.is_visible("#login-form"))
    b.close()
print("ERRORS:", errors)
