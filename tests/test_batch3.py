# «Now»: task card opens the record card; dose / check times (schedule.js) — «Give at HH:MM» until 30 min before, then the button;
# window tints and card sections (tints.js); species card opens on «In the zoo», which is the first tab (polish.js).
# Reuses the page / click / shot helpers of test_newui.py (everything above its main block).
import pathlib, sys
HERE = pathlib.Path(__file__).resolve().parent
exec((HERE / 'test_newui.py').read_text().split('\nwith sync_playwright()')[0])

with sync_playwright() as pw:
    b = pw.chromium.launch(**CHROME, args=["--no-sandbox"])
    p = page(b)
    # a 3× a day treatment with times: one slot an hour ahead (text), one 10 min ahead (button) — built from the clock now
    p.evaluate("""(() => { const db = __mock.db, me = __mock.users[0].id, A = db.collection, now = new Date();
      const hm = ms => { const d = new Date(now.getTime() + ms); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
      const rec = (bird, f, ago) => db.records.push({id: crypto.randomUUID(), type: 'obs', bird: bird.name, species_id: bird.species_id, f, note: '', event_at: new Date(now - ago).toISOString(), created_by: me, created_at: new Date().toISOString()});
      if (now.getHours() > 21) return 'too late in the day for slots ahead';
      rec(A[10], {k: 'tstart', drug: 'Lek A', freq: 2, days: 7, times: [hm(60 * 60000), '23:58', '23:59'].sort()}, 864e5);
      rec(A[11], {k: 'tstart', drug: 'Lek B', freq: 1, days: 7, times: [hm(10 * 60000), '23:59'].sort()}, 864e5);
      return loadAll().then(render); })()""")
    p.wait_for_timeout(500)
    tasks = p.locator(".bl-task").all_inner_texts()
    print("wait text:", any('Podać o' in t for t in tasks), "| button with time:", p.locator('[data-dose]').filter(has_text='·').count() > 0)
    print("times line:", [t for t in tasks if 'Lek A' in t][:1])
    shot(p, "c1_now_slots")
    # tapping the card (not the button) opens the record card
    p.locator(".bl-task", has_text='Lek A').locator(".tt").click(); p.wait_for_timeout(250); print("opened:", p.evaluate("st.scr"), "| tint:", p.evaluate("document.getElementById('app').dataset.wt"))
    print("dose times in card:", 'Godziny podania' in p.inner_text(".scroll"))
    # form: 3× a day shows three time inputs; saved sorted as f.times
    click(p, "[data-back]"); click(p, "[data-fab]"); click(p, "[data-menu=animal]"); aid = p.evaluate("__mock.db.collection[5].id"); click(p, f'[data-ck="{aid}"]'); click(p, "[data-gomulti]"); click(p, '[data-kind=tstart]')
    p.fill('#medin', 'Lek C'); click(p, '[data-fv=freq][data-i="2"]'); print("time inputs:", p.locator('.tmi input').count())
    p.fill('[data-in="fv.tm0"]', '20:00'); p.fill('[data-in="fv.tm1"]', '08:00'); p.fill('[data-in="fv.tm2"]', '14:00'); shot(p, "c2_times_form"); click(p, "[data-save]", t=600)
    print("saved times:", p.evaluate("__mock.db.records.filter(r => r.f && r.f.drug === 'Lek C').map(r => r.f.times)"))
    # tints: animal / species / enclosure / record windows differ; species card opens on «In the zoo» (first tab)
    click(p, "[data-scr=more]"); click(p, "[data-scr=animals]"); a = p.evaluate("document.getElementById('app').dataset.wt")
    click(p, ".scroll [data-ani]"); click(p, ".splink"); s = p.evaluate("document.getElementById('app').dataset.wt")
    print("tints:", a, s, "| zoo tab first & on:", p.locator('.bl-seg [data-sptab]').first.get_attribute('data-sptab'), p.evaluate("st.spTab"))
    print("section title size:", p.evaluate("getComputedStyle(document.querySelector('.cardscr .sec')).fontSize"))
    shot(p, "c3_species_card")
    click(p, "[data-scr=more]"); print("more neutral:", p.evaluate("document.getElementById('app').dataset.wt || 'none'"))
    print("ERRORS:", [e for e in errors if 'fetching the script' not in e])
    b.close()
