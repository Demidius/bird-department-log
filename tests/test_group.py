# collection: the name is optional (made from the species), and a group of animals kept together with sex ratio and juveniles
import pathlib
exec(open(pathlib.Path(__file__).resolve().parent / 'test_encl.py').read().split("with sync_playwright() as pw:")[0])
def open_new(p):
    p.click(".tab[data-tab=menu]"); p.click("[data-view=coll]"); p.click("#view-coll [data-bird-new]"); p.wait_for_timeout(200)
with sync_playwright() as pw:
    b = pw.chromium.launch(**CHROME, args=["--no-sandbox"])
    for (w, hgt, tag) in [(390, 844, 'm'), (1400, 950, 'd')]:
        p = page(b, w, hgt)
        sp = p.evaluate("__mock.db.species[0].id")
        # 1) no name -> name from the species
        open_new(p); p.select_option("#bf-sp", value=sp); p.click("#bf-save"); p.wait_for_timeout(400)
        n1 = p.evaluate("__mock.db.collection.map(x => x.name)"); print(tag, "auto names:", n1); assert len(n1) == 1 and n1[0]
        open_new(p); p.select_option("#bf-sp", value=sp); p.click("#bf-save"); p.wait_for_timeout(400)
        n2 = p.evaluate("__mock.db.collection.map(x => x.name)"); print(tag, "second:", n2); assert len(set(n2)) == 2
        # 2) group: hidden sex/ring, error on empty group, then 3.4.1 + 2 juveniles
        open_new(p); p.select_option("#bf-sp", value=sp); p.select_option("#bf-kind", value="group")
        print(tag, "sex hidden:", not p.is_visible("#bf-sex"), "| counters:", p.locator(".gnums input").count())
        p.screenshot(path=f"{out}/gr_{tag}_form.png", full_page=False)
        p.click("#bf-save"); p.wait_for_timeout(200); print(tag, "empty group err:", p.inner_text("#bf-err"))
        p.fill("#bf-gm", "3"); p.fill("#bf-gf", "4"); p.fill("#bf-gu", "1"); p.fill("#bf-gj", "2"); p.click("#bf-save"); p.wait_for_timeout(400)
        g = p.evaluate("__mock.db.collection.find(x => x.grp)"); print(tag, "group row:", g["name"], g["grp"], g["sex"]); assert g["grp"] == {"m": 3, "f": 4, "u": 1, "j": 2}
        card = p.inner_text("#bird-body"); print(tag, "card has 3.4.1:", "3.4.1" in card); assert "3.4.1" in card
        p.screenshot(path=f"{out}/gr_{tag}_card.png", full_page=False)
        p.click("[data-bird-edit]"); p.wait_for_timeout(300)
        print(tag, "edit keeps group:", p.input_value("#bf-kind"), p.input_value("#bf-gf"))
        assert p.input_value("#bf-kind") == "group" and p.input_value("#bf-gf") == "4"
        esc_close(p)
        p.click(".tab[data-tab=menu]"); p.click("[data-view=coll]"); p.wait_for_timeout(300)
        p.screenshot(path=f"{out}/gr_{tag}_list.png", full_page=False)
        p.close()
    b.close()
print("ERRORS:", errors)
