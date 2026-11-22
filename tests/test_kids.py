# record form lists the animals; after a hatching -> offer an offspring card with species, birth date and parent; any number of parents, groups too
import pathlib
exec(open(pathlib.Path(__file__).resolve().parent / 'test_encl.py').read().split("with sync_playwright() as pw:")[0])
with sync_playwright() as pw:
    b = pw.chromium.launch(**CHROME, args=["--no-sandbox"])
    for (w, hgt, tag) in [(390, 844, 'm'), (1400, 950, 'd')]:
        p = page(b, w, hgt)
        sp = p.evaluate("__mock.db.species[0]"); lab = sp["name_pl"] or sp["latin"]
        add_bird(p, "Samica A", lab)
        p.click(".tab[data-tab=menu]"); p.click("[data-view=coll]"); p.click("#view-coll [data-bird-new]"); p.wait_for_timeout(150)
        p.fill("#bf-name", "Stado"); p.select_option("#bf-sp", value=sp["id"]); p.select_option("#bf-kind", value="group"); p.fill("#bf-gm", "2"); p.fill("#bf-gf", "2"); p.click("#bf-save"); p.wait_for_timeout(300)
        # record: pick the animal from the list
        p.click(".tab[data-tab=add]"); p.click("[data-sheet=breed]"); p.click("#sheet-breed [data-new=hatch]"); p.wait_for_timeout(200)
        opts = p.eval_on_selector_all("#fld-birdsel option", "e => e.map(x => x.textContent)"); print(tag, "animals:", opts)
        assert any("Samica A" in o for o in opts) and any("Stado" in o for o in opts)
        p.select_option("#fld-birdsel", label="Samica A"); p.wait_for_timeout(100)
        print(tag, "species from animal:", p.input_value("#fld-sp") == sp["id"], "| free text hidden:", not p.is_visible("#fld-bird"))
        p.screenshot(path=f"{out}/kd_{tag}_rec.png", full_page=False)
        p.click("#f-save"); p.wait_for_timeout(500)
        print(tag, "offspring question:", p.is_visible("#cfm"), "|", p.inner_text("#cfm-p")); assert p.is_visible("#cfm")
        p.screenshot(path=f"{out}/kd_{tag}_ask.png", full_page=False)
        p.click("#cfm-ok"); p.wait_for_timeout(400)
        print(tag, "form: born", p.input_value("#bf-born"), "| sp ok:", p.input_value("#bf-sp") == sp["id"], "| parents:", p.eval_on_selector_all("#bird-form .pa-row select", "e => e.map(x => x.selectedOptions[0].textContent)"))
        p.click("#bird-form [data-pa-add]"); p.locator("#bird-form .pa-row select").last.select_option(label=[o for o in p.eval_on_selector_all("#bird-form .pa-row select >> nth=-1 >> option", "e => e.map(x => x.textContent)") if o.startswith("Stado")][0])
        p.click("#bird-form [data-pa-add]")   # an empty extra row is ignored
        p.fill("#bf-name", "Pisklę 1"); p.screenshot(path=f"{out}/kd_{tag}_form.png", full_page=True); p.click("#bf-save"); p.wait_for_timeout(400)
        kid = p.evaluate("__mock.db.collection.find(x => x.name === 'Pisklę 1')"); print(tag, "kid parents:", len(kid["parents"]), kid["born"]); assert len(kid["parents"]) == 2
        print(tag, "kid card:", p.eval_on_selector_all("#bird-body .facts div", "e => e.map(x => x.innerText.replace(/\\n/g, ': '))"))
        p.screenshot(path=f"{out}/kd_{tag}_kid.png", full_page=True)
        p.click("#bird-body .facts [data-bc]"); p.wait_for_timeout(300)
        par = p.inner_text("#bird-body .facts"); print(tag, "parent shows offspring:", "Pisklę 1" in par); assert "Pisklę 1" in par
        # birth of 3 -> group of juveniles
        p.click(".tab[data-tab=add]"); p.click("[data-sheet=breed]"); p.click("#sheet-breed [data-new=birth]"); p.wait_for_timeout(200)
        p.select_option("#fld-birdsel", label="Stado (grupa)"); p.fill("#fld-n", "3"); p.click("#f-save"); p.wait_for_timeout(500); p.click("#cfm-ok"); p.wait_for_timeout(400)
        print(tag, "birth 3 -> kind:", p.input_value("#bf-kind"), "juv:", p.input_value("#bf-gj")); assert p.input_value("#bf-kind") == "group" and p.input_value("#bf-gj") == "3"
        esc_close(p); p.close()
    b.close()
print("ERRORS:", errors)
