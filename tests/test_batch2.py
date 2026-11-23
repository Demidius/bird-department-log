# Free-note kinds with own fields (dept.js), animal picker sort / favourites / enclosure (picker.js),
# journal species colour, add-flow bottom «Back» bar, no discard question on an untouched form, dialog labels (polish.js).
# Reuses the page / click / shot helpers of test_newui.py (everything above its main block).
import pathlib, sys
HERE = pathlib.Path(__file__).resolve().parent
exec((HERE / 'test_newui.py').read_text().split('\nwith sync_playwright()')[0])

with sync_playwright() as pw:
    b = pw.chromium.launch(**CHROME, args=["--no-sandbox"])
    p = page(b)
    # free note: «Other» shown by default; closing the untouched form asks nothing
    click(p, "[data-fab]"); click(p, "[data-menu=free]")
    print("default other:", p.locator('[data-fv=kind][data-i="4"][aria-pressed=true]').count(), "| back bar:", p.locator(".shfoot .shback").count())
    click(p, '.bl-sheet .head [data-close=add]'); print("closed without question:", p.locator(".cfbox").count() == 0 and p.locator(".bl-sheet").count() == 0)
    # each kind has its own fields; saved without leftovers of another kind; title and details read them
    click(p, "[data-fab]"); click(p, "[data-menu=free]")
    fields = {}
    for i in range(4): click(p, f'[data-fv=kind][data-i="{i}"]'); fields[i] = sorted(set(p.locator('.formbody [data-fv]').evaluate_all("l => l.map(e => e.dataset.fv)")) - {'kind', 'rep'})
    print("fields:", fields)
    click(p, '[data-fv=awhat][data-i="0"]'); click(p, '[data-fv=aurg][data-i="2"]')
    click(p, '[data-fv=kind][data-i="2"]'); click(p, '[data-fv=swhat][data-i="0"]'); click(p, '[data-fv=swhat][data-i="2"]'); p.fill('[data-in="fv.sqty"]', '3 worki'); shot(p, "b1_delivery")
    click(p, "[data-save]", t=600)
    print("saved f:", p.evaluate("__mock.db.records.filter(r => r.f && r.f.k === 'dept').map(r => r.f).pop()"))
    click(p, "[data-scr=logs]"); print("journal title:", p.locator(".scroll [data-rec]").first.locator("b").first.inner_text())
    click(p, ".scroll [data-rec]"); print("card:", p.inner_text(".scroll").replace(chr(10), ' | ')[:200])
    # discard dialog labels after something is entered
    click(p, "[data-back]"); click(p, "[data-fab]"); click(p, "[data-menu=free]"); click(p, '[data-fv=kind][data-i="0"]'); click(p, '.bl-sheet .head [data-close=add]')
    print("dialog buttons:", p.locator(".cfbox button").all_inner_texts()); click(p, '.cfbox [data-cf=yes]')
    # animal picker: enclosure line, sort switch, favourites
    click(p, "[data-fab]"); click(p, "[data-menu=animal]")
    print("sort buttons:", p.locator("[data-wsort]").all_inner_texts(), "| enclosure lines:", p.locator(".wrow .wpl").count() > 0, "| stars:", p.locator(".wrow .fav").count() > 0)
    print("bottom bar at bottom:", p.evaluate("(() => { const r = document.querySelector('.shfoot').getBoundingClientRect(); return Math.round(innerHeight - r.bottom); })()"))
    click(p, ".wrow .fav", 1); click(p, "[data-wsort=fav]"); print("favourites:", p.locator(".wrow").count(), "| on:", p.locator(".wrow .fav.on").count())
    click(p, "[data-wsort=name]"); names = p.locator(".wrow b").all_inner_texts(); print("by name, first:", names[:3])
    shot(p, "b2_picker")
    click(p, ".shfoot .shback"); print("back bar → menu:", p.locator(".dial").count())
    click(p, ".dial ~ [data-close=add], .dialx")
    # journal: species coloured in the second line
    click(p, "[data-scr=logs]"); print("species coloured:", p.locator(".bl-rec .spn").count() > 0)
    shot(p, "b3_journal")
    print("ERRORS:", [e for e in errors if 'fetching the script' not in e])
    b.close()
