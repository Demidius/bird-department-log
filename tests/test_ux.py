# ux.js: merged mating rows in the journal (separate in animal cards), species «General» section, empty fields tinted in edit forms,
# drug field list on tap with filtering, clear cross in filled fields.
# Reuses the page / click / shot helpers of test_newui.py (everything above its main block).
import pathlib, sys
HERE = pathlib.Path(__file__).resolve().parent
exec((HERE / 'test_newui.py').read_text().split('\nwith sync_playwright()')[0])

with sync_playwright() as pw:
    b = pw.chromium.launch(**CHROME, args=["--no-sandbox"])
    p = page(b, pre="__mock.db.drugs = [{id: crypto.randomUUID(), name: 'Baytril', substance: 'enrofloksacyna', routes: [0], form: 0, conc: '', maker: '', dose: '', use: '', contra: '', storage: '', note: '', locked: []}]")
    # mating of two animals → one row in the journal, separate rows in each animal card
    ids = p.evaluate("(() => { const A = __mock.db.collection, s = A[0].species_id, two = A.filter(a => a.species_id === s).slice(0, 2); return two.map(a => a.id); })()")
    click(p, "[data-fab]"); click(p, "[data-menu=animal]"); click(p, f'[data-ck="{ids[0]}"]'); click(p, f'[data-ck="{ids[1]}"]'); click(p, "[data-gomulti]")
    click(p, '[data-kind=mate]'); click(p, "[data-save]", t=600)
    print("mate records:", p.evaluate("__mock.db.records.filter(r => r.f && r.f.k === 'mate').length"))
    click(p, "[data-scr=logs]"); rows = p.locator('.scroll .bl-rec').filter(has_text='+').all_inner_texts()
    print("journal merged rows:", len(rows), rows[:1])
    shot(p, "u1_journal")
    click(p, "[data-scr=more]"); click(p, "[data-scr=animals]"); click(p, f'.scroll [data-ani="{ids[0]}"]')
    print("animal card own row (no +):", p.locator('.cardscr .bl-rec').filter(has_text='+').count() == 0)
    # species card: General section with sex / breeding / health; zoo tab without health
    click(p, ".splink"); click(p, "[data-sptab=zoo]")
    secs = p.locator('.cardscr .sec').all_inner_texts(); print("general section:", any('OGÓLNE' in s.upper() for s in secs), "| general rows:", p.evaluate("[...document.querySelectorAll('.accs')].pop().querySelectorAll('[data-acc]').length"))
    print("zoo tab rows:", p.evaluate("[...document.querySelectorAll('.accs')][0].querySelectorAll('[data-acc]').length"))
    # species edit: empty fields tinted
    click(p, '[data-edform=sp]'); print("empty fields tinted:", p.locator('.bl-field.isempty').count() > 0); shot(p, "u2_species_edit")
    # drug field: list on tap, filter, clear cross
    p.evaluate("st.ed = null; render()")
    click(p, "[data-scr=now]"); click(p, "[data-fab]"); click(p, "[data-menu=animal]"); click(p, f'[data-ck="{ids[0]}"]'); click(p, "[data-gomulti]"); click(p, '[data-kind=tstart]')
    p.click('#medin'); p.wait_for_timeout(250); print("list on tap:", p.locator('.clist [data-med]').all_inner_texts()[:3])
    p.type('#medin', 'bay'); p.wait_for_timeout(300); print("filtered:", p.locator('.clist [data-med]').count(), p.locator('.clist [data-med] b').all_inner_texts())
    print("clear cross shown:", p.locator('.combo .clrw.has .clrx').count()); click(p, '.combo .clrx'); print("cleared:", repr(p.input_value('#medin')), "| state:", repr(p.evaluate("st.add.fv.drug")))
    p.fill('[data-in="fv.dose"]', '0,5 ml'); p.wait_for_timeout(100); print("dose cross:", p.locator('.clrw.has [data-clr]').count() >= 1)
    shot(p, "u3_drug_field")
    print("ERRORS:", [e for e in errors if 'fetching the script' not in e])
    b.close()
