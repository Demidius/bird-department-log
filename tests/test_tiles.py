# Species tiles (2 per row, photo of the species or of its animal) and journal photos
# (record photo → species / animal photo → enclosure photo; the kind icon moves to the corner).
# Reuses the page / click / shot helpers of test_newui.py (everything above its main block).
import pathlib, sys
HERE = pathlib.Path(__file__).resolve().parent
exec((HERE / 'test_newui.py').read_text().split('\nwith sync_playwright()')[0])

with sync_playwright() as pw:
    b = pw.chromium.launch(**CHROME, args=["--no-sandbox"])
    p = page(b)
    p.evaluate("""(() => { const db = __mock.db, me = __mock.users[0].id, A = db.collection;
      const img = c => 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8" fill="' + c + '"/></svg>');
      const path = me + '/' + crypto.randomUUID() + '.jpg'; db.photos.push({id: crypto.randomUUID(), owner_type: 'bird', owner_id: A[34].id, path, created_by: me, created_at: new Date().toISOString()});
      __mock.files.set(path.replace('.jpg', '_t.jpg'), img('red')); return LOAD.photos().then(render); })()""")
    p.wait_for_timeout(600)
    sid = p.evaluate("__mock.db.collection[34].species_id")
    click(p, "[data-scr=more]"); click(p, "[data-scr=species]"); p.wait_for_timeout(300)
    cols = p.evaluate("getComputedStyle(document.querySelector('.stack:has(> [data-sp])')).gridTemplateColumns.split(' ').length")
    print("species grid cols:", cols, "| tile photo:", p.locator(f'[data-sp="{sid}"] .bl-av img').count())
    shot(p, "t1_species_tiles")
    rid = p.evaluate("(() => { const a = __mock.db.collection[34]; const r = D.rec.find(x => key(x.bird) === key(a.name)); return r ? r.id : ''; })()")
    click(p, "[data-scr=logs]"); p.wait_for_timeout(300)
    print("journal photo:", p.locator(f'[data-rec="{rid}"] .bl-badge.phb img').count(), "| corner icon:", p.locator(f'[data-rec="{rid}"] .bl-badge .kb svg').count())
    print("journal badge px:", p.evaluate("document.querySelector('.bl-rec > .bl-badge').getBoundingClientRect().width"))
    shot(p, "t2_journal_photos")
    # an animal without its own photo shows the species photo in its avatar
    p.evaluate("""(() => { const db = __mock.db, me = __mock.users[0].id, a = db.collection.find(x => x.species_id !== db.collection[34].species_id && !db.photos.some(f => f.owner_id === x.id));
      const path = me + '/' + crypto.randomUUID() + '.jpg'; db.photos.push({id: crypto.randomUUID(), owner_type: 'species', owner_id: a.species_id, path, created_by: me, created_at: new Date().toISOString()});
      __mock.files.set(path.replace('.jpg', '_t.jpg'), 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8" fill="blue"/></svg>')); window.__noPh = a.id; return LOAD.photos().then(render); })()""")
    p.wait_for_timeout(400); click(p, "[data-scr=more]"); click(p, "[data-scr=animals]"); p.wait_for_timeout(300)
    print("species photo as avatar:", 'blue' in (p.locator(f'.scroll [data-ani="{p.evaluate("window.__noPh")}"] .bl-av img').get_attribute('src') or ''))
    print("ERRORS:", [e for e in errors if 'fetching the script' not in e])
    b.close()
