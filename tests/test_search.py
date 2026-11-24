# Search in lists matches word starts only, by each list's main name: animals — species name, species — name, drugs — name,
# enclosures — enclosure name (list + picker). Reuses the helpers of test_newui.py.
import pathlib, sys
HERE = pathlib.Path(__file__).resolve().parent
exec((HERE / 'test_newui.py').read_text().split('\nwith sync_playwright()')[0])

with sync_playwright() as pw:
    b = pw.chromium.launch(**CHROME, args=["--no-sandbox"])
    p = page(b)
    print("qhit:", p.evaluate("[qhit('Bażanciak zielonoszyi', 'ziel'), qhit('Bażanciak zielonoszyi', 'baz'), qhit('Bażanciak zielonoszyi', 'anc'), qhit('Bławatnik', 'bla'), qhit('Bażanciak zielonoszyi', 'ziel baz')]"))
    print("rebuilt:", p.evaluate("['animalsByPlace', 'listScreen', 'logsScreen', 'drugsScreen', 'medForm', 'arriveForm', 'animalEdit'].filter(n => !/qhit/.test(window[n].toString()))"), "(empty = all)")
    names = lambda sel: p.locator(sel).all_inner_texts()
    p.evaluate("st.scr = 'animals'; st.lq = 's'; render()")
    an = names('.scroll [data-ani] b'); print("animals 's' all start with s:", bool(an) and all(any(w.lower().startswith('s') for w in t.replace('ł', 'l').split()) for t in an), len(an))
    p.evaluate("st.scr = 'species'; st.lq = 'ko'; render()"); print("species 'ko':", names('.scroll [data-sp] b')[:4])
    p.evaluate("st.scr = 'places'; render()"); p.type('#plq', 'hal'); p.wait_for_timeout(300)
    print("places 'hal':", names('.scroll [data-plc] b'), "| focus:", p.evaluate("document.activeElement.id"))
    shot(p, "s1_places")
    print("ERRORS:", [e for e in errors if 'fetching the script' not in e])
    b.close()
