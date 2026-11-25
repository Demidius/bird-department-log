# pc.js: computer layout (≥1000px) — menu, list, card; one header line; calendar month + day; cards with photo on the right;
# forms centred; phone width unchanged; species four in a row with search + «New species» in one row.
# ux2.js 5: enclosure card residents first, temperature folded; 7: enclosures folded; 8: add / take out animals. Reuses test_newui.py helpers.
import pathlib, sys
HERE = pathlib.Path(__file__).resolve().parent
exec((HERE / 'test_newui.py').read_text().split('\nwith sync_playwright()')[0])

with sync_playwright() as pw:
    b = pw.chromium.launch(**CHROME, args=["--no-sandbox"])
    p = page(b, 1360, 820)
    print("rail / list / card:", p.locator('.pc-rail').count(), p.locator('.pc-list').count(), p.locator('.pc-det').count())
    click(p, '.pc-rail [data-scr=logs]'); p.locator('.pc-list [data-rec]').first.click(); p.wait_for_timeout(300)
    print("record opened right:", p.locator('.pc-det .cardscr').count(), "| row marked:", p.locator('.pc-list .pcsel').count())
    hs = p.evaluate("[...document.querySelectorAll('.pc-list>.hd,.pc-det .topbar')].map(e => Math.round(e.getBoundingClientRect().height))")
    print("one header height:", hs)
    shot(p, "pc1_journal")
    click(p, '.pc-rail [data-scr=cal]')
    print("calendar month cells:", p.locator('.pcgrid .pcd').count() >= 28, "| day panel:", p.locator('.pcdayh').count())
    p.locator('.pcd:not(.out)').nth(4).click(); p.wait_for_timeout(200); print("day click stays on calendar:", p.evaluate("st.scr"))
    shot(p, "pc2_calendar")
    click(p, '.pc-rail [data-scr=animals]'); p.locator('.pc-list [data-ani]').first.click(); p.wait_for_timeout(300)
    print("animal card photo right:", p.locator('.pc-det .pchero .sphero').count())
    click(p, '.pc-det [data-edform=an]'); p.wait_for_timeout(300)
    r = p.evaluate("(() => { const s = document.querySelector('.bl-sheet').getBoundingClientRect(); return [Math.round(s.left), Math.round(s.right)]; })()")
    print("form centred:", abs((r[0] + r[1]) / 2 - 680) < 30, r)
    p.evaluate("st.ed = null; render()")
    # enclosure card: residents before temperature, temperature folded
    pid = p.evaluate("(D.pl.find(x => tempRecs(x).length && anOfPlace(x).length) || D.pl.find(x => x.kind !== 'building')).id")
    p.evaluate(f"st.plc = '{pid}'; st.scr = 'pcard'; render()"); p.wait_for_timeout(200)
    print("sections:", [t.split('\n')[0] for t in p.locator('.pc-det .sec').all_inner_texts()][:3], "| folded:", p.locator('.pc-det .tbox').count() == 0)
    print("−/+ on Animals tile:", p.locator('.pc-det .pmvb').count())
    p.locator('.pc-det .pmvb [data-pmv=out]').click(); p.wait_for_timeout(200)
    print("take out: picker of residents:", p.evaluate("[st.add && st.add.step, st.add && st.add.pmv && st.add.pmv.mode]"))
    p.evaluate("st.add = null; render()")
    click(p, '.pc-rail [data-scr=places]'); print("places folded:", p.evaluate("D.pl.every(x => st.folded.has(x.id))"))
    click(p, '.pc-rail [data-scr=species]')
    print("species 4 in a row:", p.evaluate("getComputedStyle(document.querySelector('.pc-spw .stack:has(> [data-sp])')).gridTemplateColumns.split(' ').length"), "| tool row:", p.locator('.pctool .bl-search').count(), p.locator('.pctool .newani').count())
    shot(p, "pc3_species")
    print("ERRORS:", [e for e in errors if 'fetching the script' not in e])
    m = page(b); print("phone: no rail:", m.locator('.pc-rail').count() == 0, "| bottom nav:", m.locator('.bl-nav').count())
    b.close()
