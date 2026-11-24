# ux2.js: comment field has no scrollbar and grows with the text; photo links refresh; card type label; undo last dose. Reuses the helpers of test_newui.py.
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
    # 3) card type label
    p.evaluate("st.ani = D.an[0].id; st.scr = 'card'; render()"); p.wait_for_timeout(200)
    print("card label:", p.locator('.topbar .tbcat').all_inner_texts())
    # 2) old photo links are dropped and re-signed
    print("old links re-signed:", p.evaluate("""(async () => { const a = D.an[0], path = me + '/t1.jpg';
      __mock.db.photos.push({id: crypto.randomUUID(), owner_type: 'bird', owner_id: a.id, path, width: 10, height: 10, created_by: me, created_at: new Date().toISOString()});
      __mock.files.set(path, 'data:,'); __mock.files.set(thumbOf(path), 'data:,'); await LOAD.photos(); await ensureUrls([thumbOf(path)]);
      const k = [...urls.keys()][0]; if (!k) return 'no photos'; const u = urls.get(k); urlAt.set(k, 0); await ensureUrls([k]); return urls.has(k) && urlAt.get(k) > Date.now() - 5000; })()"""))
    # 4) undo the last dose of today next to «Give»
    p.evaluate("""(() => { const a = D.an.find(x => !x.grp); const at = Date.now() - 3 * 3600e3;
      D.rec.unshift({id: 'rx1', k: 'tstart', type: 'obs', bird: a.name, at, by: me, note: '', f: {k: 'tstart', drug: 'Testlek', freq: 1, days: 3, times: ['00:01', '23:58']}});
      D.rec.unshift({id: 'dx1', k: 'tdose', type: 'obs', bird: a.name, at: Math.max(at + 1000, today0() + 60000), by: me, note: '', f: {k: 'tdose', drug: 'Testlek'}}); st.scr = 'now'; render(); })()""")
    p.wait_for_timeout(200); print("undo dose button:", p.locator('[data-undorec="dx1"]').count())
    print("ERRORS:", [e for e in errors if 'fetching the script' not in e])
    b.close()
