# ux3.js: breeding timings and forecast; expected events in the calendar; resize re-render only on phone ↔ computer;
# «until cancelled»; arrival «from», age (stage / number / birth date) and «when» (date only / no date); users: sign-in details,
# passwords for the admin, login change; computer card label; age in the card edit. Reuses test_newui.py helpers.
import pathlib, sys
HERE = pathlib.Path(__file__).resolve().parent
exec((HERE / 'test_newui.py').read_text().split('\nwith sync_playwright()')[0])

with sync_playwright() as pw:
    b = pw.chromium.launch(**CHROME, args=["--no-sandbox"])
    p = page(b)
    # 1) breeding timings: reference 16, ours 12 → forecast 14; fledging recorded → expected fledging gone
    print("timings:", p.evaluate("""(() => {
      const s = [...D.sp.values()].find(x => !isMammal(x)), inf = spInfo(s); inf.incub_days = 16; inf.fledge_days = 16;
      const mom = D.an.find(a => !a.grp); mom.species_id = s.id; const H = Date.now() - 12 * DAY;
      D.an.push({id: 'kid1', name: 'Pisklak X', species_id: s.id, parents: [mom.id], born: new Date(H).toISOString(), status: 'active'});
      const R = (id, k, bird, at, f = {}) => D.rec.push({id, k, type: 'obs', bird, sp: s.id, at, by: me, note: '', f: Object.assign({k}, f)});
      R('i1', 'incub', mom.name, H - 12 * DAY); R('h1', 'hatch', mom.name, H, {n: 1});
      const before = [...calEvents().values()].flat().filter(e => e.exp && e.r.id === 'h1').length;
      R('f1', 'fledge', 'Pisklak X', Date.now());
      const after = [...calEvents().values()].flat().filter(e => e.exp && e.r.id === 'h1').length;
      st.rec = 'f1'; st.scr = 'rcard'; render(); const tile = document.querySelector('.brdt').innerText.replace(/\\n/g, ': ');
      return JSON.stringify([brdStats(s).est, before, after, tile]); })()"""))
    # 3) phone resize: no re-render
    p.evaluate("window._n = 0; const r = render; render = function () { window._n++; return r(); }; st.scr = 'now'; render(); _n = 0")
    p.set_viewport_size({"width": 390, "height": 500}); p.wait_for_timeout(400); print("renders on phone resize:", p.evaluate("_n"))
    p.set_viewport_size({"width": 390, "height": 844})
    # 5) until cancelled
    a0 = p.evaluate("__mock.db.collection[5].id")
    click(p, "[data-scr=more]"); click(p, "[data-scr=animals]"); click(p, f'.scroll [data-ani="{a0}"]')
    click(p, "[data-add=an]"); click(p, "[data-kind=tstart]"); click(p, "[data-medtoggle]"); click(p, "[data-med]")
    click(p, '[data-fv=days][data-n="7"]'); click(p, '[data-dopen]'); click(p, "[data-save]", t=600)
    print("until cancelled:", p.evaluate("__mock.db.records.filter(r => r.type === 'tstart').map(r => [r.f.days, r.f.open]).pop()"))
    # 6, 7) arrival
    p.evaluate("(() => { const s = [...D.sp.values()].find(x => /nikobar/i.test(x.name_pl)); const i = spInfo(s); i.life = 'do 20 lat'; i.fledge_days = 14; i.mature_years = 2; })()")
    click(p, "[data-scr=more]"); click(p, "[data-scr=animals]"); click(p, "[data-arrive]")
    print("from options:", p.locator('[data-fv=from]').all_inner_texts())
    p.fill("#spin", "nikobar"); p.wait_for_timeout(300); click(p, "[data-spsel]"); click(p, '[data-fv=cnt][data-i="2"]'); click(p, "[data-fv=to]", 0)
    click(p, '[data-fv=am0][data-s=n]'); p.fill('[data-in="fv.ag0"]', '5'); click(p, '[data-fv=am1][data-s=a]'); click(p, '[data-fv=ac1][data-s=old]'); click(p, '[data-fv=am2][data-s=d]'); p.fill('[data-in="fv.bd2"]', '2024-05-01')
    click(p, '[data-atmode=d]'); p.fill('[data-in=atd]', '2026-11-20'); n0 = p.evaluate("__mock.db.records.length"); click(p, "[data-save]", t=900)
    print("animals:", p.evaluate("__mock.db.collection.slice(-3).map(a => [a.born, a.age_class, a.age_n, a.age_at])"))
    print("date-only records:", p.evaluate(f"__mock.db.records.slice({n0}).map(r => [r.f.k, r.f.nt])"))
    p.evaluate("st.ani = __mock.db.collection.slice(-2)[0].id; st.scr = 'card'; render()"); p.wait_for_timeout(150)
    print("card stage:", [t.replace(chr(10), ': ') for t in p.locator('.bl-facts div').all_inner_texts() if 'Wiek' in t])
    click(p, "[data-scr=more]"); click(p, "[data-scr=animals]"); click(p, "[data-arrive]")
    p.fill("#spin", "nikobar"); p.wait_for_timeout(300); click(p, "[data-spsel]"); click(p, "[data-fv=to]", 0); click(p, '[data-atmode=none]')
    n0 = p.evaluate("__mock.db.records.length"); click(p, "[data-save]", t=800)
    print("no date → records:", p.evaluate(f"__mock.db.records.length - {n0}"), "| arrived:", p.evaluate("__mock.db.collection.slice(-1)[0].arrived"))
    # 8, 9) users: generate, sign-in details, password in the staff card, login field
    p.evaluate("st.scr = 'users'; render()"); p.wait_for_timeout(200)
    print("list login:", p.locator('.mrow small').first.inner_text())
    click(p, '[data-uform=new]'); p.fill('[data-uin=name]', 'Test'); p.fill('[data-uin=login]', 'testtest'); click(p, '[data-upgen]')
    pw = p.locator('[data-uin=pass]').input_value(); click(p, '[data-usave]', t=600)
    print("details window:", p.locator('.creds').count(), pw in p.locator('.creds').inner_text()); click(p, '[data-ccclose]', 0)
    tid = p.evaluate("[...D.prof.values()].find(x => x.login === 'testtest').id"); click(p, f'[data-uform="{tid}"]'); click(p, '[data-upold]')
    print("password in card:", p.locator('.pwv').inner_text() == pw, "| login field:", p.locator('[data-uin=login]').input_value())
    p.evaluate("st.uform = null; render()")
    # 12) age in the card edit (stage), saved with the assessment date
    p.evaluate("(() => { const s = spBy(D.an[0].species_id), i = spInfo(s); i.life = 'do 20 lat'; i.mature_years = 2; })()")
    p.evaluate("go({scr: 'card', ani: D.an[0].id})"); p.wait_for_timeout(200); click(p, '.topbar [data-edform=an]')
    click(p, '[data-eset="age.am"][data-s=a]'); click(p, '[data-eset="age.ac"][data-s=adult]'); click(p, '[data-edsave]', t=600)
    print("edit age:", p.evaluate("(() => { const a = __mock.db.collection.find(x => x.id === D.an[0].id); return [a.born, a.age_class, !!a.age_at]; })()"))
    # 9) login change through the mock admin function
    p.evaluate("st.scr = 'users'; render()"); click(p, f'[data-uform="{tid}"]'); p.fill('[data-uin=login]', 'testowy'); click(p, '[data-usave]', t=600)
    print("login changed:", p.evaluate(f"__mock.db.profiles.find(x => x.id === '{tid}').login"))
    # 10) computer: card label on the right card, no back button in the middle column
    q = page(b, 1360, 800)
    q.evaluate("go({scr: 'status', nowStatus: 'treatment', nowStatusTab: 'animals'})"); q.wait_for_timeout(200); q.locator('.pc-list [data-ani]').first.click(); q.wait_for_timeout(300)
    print("pc card label:", q.locator('.pc-det .topbar .tbcat').all_inner_texts(), "| middle back hidden:", not q.locator('.pc-list>.topbar>[data-back]').is_visible())
    print("ERRORS:", [e for e in errors if 'fetching the script' not in e])
    b.close()
