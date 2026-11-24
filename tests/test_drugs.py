# Drug catalogue (drugs.js): card, form, AI locks, delete; species sources (refs.js).
# Reuses the page / click / shot helpers of test_newui.py (everything above its main block).
import pathlib, sys
HERE = pathlib.Path(__file__).resolve().parent
exec((HERE / 'test_newui.py').read_text().split('\nwith sync_playwright()')[0])
PRE = """(() => { const db = __mock.db; db.drugs = [];
  const s = db.species[0]; s.info = Object.assign({}, s.info, {diet_wild: {pl: 'Owoce (1)(2), owady (3)', ru: 'Плоды (1)(2)', en: 'Fruit (1)(2)'},
    sources: [{t: 'Źródło A', url: 'https://example.org/a'}, {t: 'Źródło B', url: 'https://example.org/b'}]}); window.__sp = s.id; })()"""

with sync_playwright() as pw:
    b = pw.chromium.launch(**CHROME, args=["--no-sandbox"])
    p = page(b, pre=PRE)
    # catalogue: More → Drugs; names from records without a card are offered
    click(p, "[data-scr=more]"); print("more row:", p.locator('.mrow[data-scr=drugs]').count()); click(p, "[data-scr=drugs]")
    print("from records:", p.locator('[data-dname]').all_inner_texts()[:2])
    click(p, '[data-dname]'); print("prefilled name:", p.input_value('[data-din=name]'))
    p.fill('[data-din=substance]', 'meloksykam'); click(p, '[data-dchip=form][data-i="2"]'); p.fill('[data-din=conc]', '1,5 mg/ml')
    click(p, '[data-dchip=routes][data-i="0"]'); p.fill('[data-din=dose]', '0,2 mg/kg 1× dziennie'); shot(p, "d1_form")
    click(p, '[data-dsave]', t=600)
    print("saved row:", p.evaluate("(({name, substance, form, conc, routes, dose}) => ({name, substance, form, conc, routes, dose}))(__mock.db.drugs[0] || {})"))
    print("card:", p.evaluate("st.scr"), "| tint:", p.evaluate("document.getElementById('app').dataset.wt"), "| uses:", p.locator('.cardscr .stack [data-rec]').count())
    print("photo block:", p.locator('[data-upload^="drug:"]').count()); shot(p, "d2_card")
    # AI locks (admin): lock «dose», saved in locked
    click(p, '[data-dedit]'); click(p, '[data-dlock=dose]'); print("lock on:", p.locator('[data-dlock=dose][aria-pressed=true]').count()); click(p, '[data-dsave]', t=500)
    print("locked saved:", p.evaluate("__mock.db.drugs[0].locked"), "| err:", p.locator("#ferr").all_inner_texts())
    # duplicate name refused
    click(p, '[data-scr=more]'); click(p, '[data-scr=drugs]'); click(p, '[data-dnew]'); p.fill('[data-din=name]', 'meloksykam'); click(p, '[data-dsave]', t=400)
    print("dup error:", p.locator('#ferr').count() > 0 or p.evaluate("__mock.db.drugs.length")); click(p, '.bl-sheet [data-dclose]')
    # treatment record card links to the drug card
    click(p, "[data-scr=logs]"); p.locator('.scroll [data-rec]', has_text='Meloksykam').first.click(); p.wait_for_timeout(250)
    print("drug plate:", p.locator('.bl-whochip[data-drug]').count()); click(p, '.bl-whochip[data-drug]'); print("→", p.evaluate("st.scr"))
    # delete (admin): two taps
    click(p, '[data-dedit]'); click(p, '[data-ddel]'); print("ask:", p.locator('.ddel.ask').count()); click(p, '[data-ddel]', t=500)
    print("deleted:", p.evaluate("__mock.db.drugs.length"), "| screen:", p.evaluate("st.scr"))
    # species sources
    click(p, "[data-scr=more]"); click(p, "[data-scr=species]"); click(p, f'[data-sp="{p.evaluate("window.__sp")}"]'); click(p, '[data-sptab=wild]'); click(p, '[data-acc=diet_wild]')
    print("refs:", p.locator('.accb .ref').count(), "| (3) stays text:", '(3)' in p.inner_text('.accb'), "| sources:", p.locator('.srcl li').count(), "| last section:", p.locator('.cardscr .sec').last.inner_text().split(chr(10))[0])
    click(p, '.accb .ref'); p.wait_for_timeout(300); print("highlight:", p.locator('#src-1.hi').count()); shot(p, "d3_sources")
    print("ERRORS:", [e for e in errors if 'fetching the script' not in e])
    b.close()
