# ux.js 8–10: record card of mating / birth shows all animals on separate plates; animal card edit lists animals of the species
# and switches between them; calendar: expected fledging after hatching, record totals. Reuses the helpers of test_newui.py.
import pathlib, sys
HERE = pathlib.Path(__file__).resolve().parent
exec((HERE / 'test_newui.py').read_text().split('\nwith sync_playwright()')[0])

with sync_playwright() as pw:
    b = pw.chromium.launch(**CHROME, args=["--no-sandbox"])
    p = page(b)
    ids = p.evaluate("(() => { const A = __mock.db.collection, s = A[0].species_id; return A.filter(a => a.species_id === s).slice(0, 2).map(a => a.id); })()")
    # mating of two animals → card of one record shows both
    click(p, "[data-fab]"); click(p, "[data-menu=animal]"); click(p, f'[data-ck="{ids[0]}"]'); click(p, f'[data-ck="{ids[1]}"]'); click(p, "[data-gomulti]")
    click(p, '[data-kind=mate]'); click(p, "[data-save]", t=600)
    rid = p.evaluate("D.rec.find(r => r.k === 'mate').id")
    p.evaluate(f"st.rec = '{rid}'; st.scr = 'rcard'; render()"); p.wait_for_timeout(300)
    print("mate plates:", p.locator('.matechips .bl-whochip').count())
    shot(p, "r1_mate")
    # birth: mother + young (card with parents and born date)
    p.evaluate("""(() => { const m = D.an.find(a => a.sex === 'f' && !a.grp); const at = Date.now();
      D.an.push(Object.assign({}, m, {id: 'kid1', name: anTitle(m) + ' - młode 1', sex: '', parents: [m.id], born: new Date(at).toISOString().slice(0, 10)}));
      D.rec.unshift({id: 'rb1', k: 'birth', type: 'obs', bird: m.name, at, by: me, note: '', f: {k: 'birth'}}); st.rec = 'rb1'; st.scr = 'rcard'; render(); })()"""); p.wait_for_timeout(300)
    print("birth labels:", p.locator('.mclab').all_inner_texts(), "| plates:", p.locator('.matechips .bl-whochip').count())
    # animal edit: animals of the species, switch
    p.evaluate(f"st.ani = '{ids[0]}'; openEd('an'); render()"); p.wait_for_timeout(200)
    n = p.locator('[data-edani]').count(); print("species animals in edit:", n)
    p.locator(f'[data-edani="{ids[1]}"]').click(); p.wait_for_timeout(200)
    print("switched:", p.evaluate("st.ed.id") == ids[1], "| pressed:", p.locator(f'[data-edani="{ids[1]}"]').get_attribute('aria-pressed'))
    # calendar: expected fledging after hatching; record totals
    p.evaluate("""(() => { const a = D.an.find(x => x.species_id && !x.grp); spInfo(spBy(a.species_id)).fledge_days = 15;
      D.rec.unshift({id: 'rh1', k: 'hatch', type: 'obs', bird: a.name, at: Date.now() - DAY, by: me, note: '', f: {k: 'hatch'}}); })()""")
    print("fledging forecast:", p.evaluate("[...calEvents().values()].flat().some(e => e.exp && e.r.id === 'rh1')"))
    p.evaluate("""(() => { for (let i = 0; i < 5; i++) D.rec.unshift({id: 'rc' + i, k: 'obs', type: 'obs', bird: D.an[0].name, at: Date.now() - 2 * DAY + i, by: me, note: '', f: {}}); st.ed = null; st.scr = 'cal'; render(); })()""")
    day = p.evaluate("dayKey(D.rec.find(r => r.id === 'rc0').at)")
    expected = p.evaluate("d => calEvents().get(d).filter(e => !e.exp).length", day)
    p.evaluate("([y,m]) => { st.cy = +y; st.cm = +m; render(); }", day.split('-')[:2])
    assert p.locator(f'[data-day="{day}"] .cal-count.recorded').inner_text() == str(expected)
    print("ERRORS:", [e for e in errors if 'fetching the script' not in e])
    b.close()
