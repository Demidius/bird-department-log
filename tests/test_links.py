# Links to other cards (links.js): enclosure / species cells open their card, the place plate of a record card opens the enclosure,
# rows inside cards that lead to another card carry the ↗ arrow.
# Reuses the page / click / shot helpers of test_newui.py (everything above its main block).
import pathlib, sys
HERE = pathlib.Path(__file__).resolve().parent
exec((HERE / 'test_newui.py').read_text().split('\nwith sync_playwright()')[0])

with sync_playwright() as pw:
    b = pw.chromium.launch(**CHROME, args=["--no-sandbox"])
    p = page(b)
    click(p, "[data-scr=more]"); click(p, "[data-scr=animals]"); click(p, ".scroll [data-ani]")
    print("enclosure cell is a link:", p.locator('.bl-facts .golink').count() > 0, "| species link arrow:", p.locator('.splink .goic').count(), "| row arrows:", p.locator('.cardscr button.bl-who .goic').count() > 0)
    shot(p, "l1_animal_links")
    p.locator('.bl-facts .golink dd').first.click(); p.wait_for_timeout(250); print("opened:", p.evaluate("st.scr"))
    print("part-of cell is a link:", p.locator('.bl-facts .golink').count() > 0)
    # record card about a place: the plate opens the enclosure
    p.evaluate("""(() => { const db = __mock.db, me = __mock.users[0].id, pl = db.enclosures.find(x => x.kind !== 'building');
      db.records.push({id: crypto.randomUUID(), type: 'obs', bird: pl.name, species_id: null, f: {k: 'env', place: pl.name}, note: 'test', event_at: new Date().toISOString(), created_by: me, created_at: new Date().toISOString()});
      return loadAll().then(render); })()""")
    click(p, "[data-scr=logs]"); click(p, ".scroll [data-rec]")
    print("place plate link:", p.locator('.cardscr div.bl-whochip.golink').count()); p.locator('.cardscr div.bl-whochip').click(); p.wait_for_timeout(250); print("→", p.evaluate("st.scr"))
    print("ERRORS:", [e for e in errors if 'fetching the script' not in e])
    b.close()
