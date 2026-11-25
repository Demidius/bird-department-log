# Medication routes: translated labels, stable stored values and legacy prescriptions.
from pathlib import Path

exec((Path(__file__).resolve().parent / 'test_newui.py').read_text().split('\nwith sync_playwright()')[0])

with sync_playwright() as pw:
    b = pw.chromium.launch(**CHROME, args=['--no-sandbox'])
    p = page(b, w=320)
    p.evaluate("go({scr:'card', ani:D.an[0].id})")
    click(p, '[data-add=an]')
    click(p, '[data-kind=tstart]')
    routes = p.locator('[data-fv=route]')
    assert routes.all_inner_texts() == [
        'p.o. (doustnie)', 'i.m. (domięśniowo)', 's.c. (podskórnie)', 'i.v. (dożylnie)',
        'miejscowo', 'do wody', 'do karmy', 'na skórę'
    ]
    shot(p, 'routes_pl')

    p.evaluate("lang = 'ru'; render()")
    assert routes.all_inner_texts()[-3:] == ['в воду', 'в корм', 'на кожу']
    click(p, '[data-fv=route][data-s="do karmy"]')
    p.evaluate("lang = 'en'; render()")
    assert routes.all_inner_texts()[-3:] == ['in water', 'in feed', 'on the skin']
    assert p.locator('[data-fv=route][aria-pressed=true]').inner_text() == 'in feed'
    p.fill('#medin', 'Test medication')
    click(p, '[data-save]')
    p.wait_for_function("__mock.db.records.some(r => r.type === 'tstart' && r.f.drug === 'Test medication' && r.f.route === 'do karmy')")

    p.evaluate("""() => {
        const old = D.rec.find(r => r.f.route === 'p.o.');
        openEdit({...old, f: {...old.f, route: 'местно'}});
        lang = 'pl';
        render();
    }""")
    assert p.locator('[data-fv=route][aria-pressed=true]').inner_text() == 'miejscowo'
    p.evaluate("""() => {
        const old = D.rec.find(r => r.f.route === 'p.o.');
        openEdit(old);
        render();
    }""")
    assert p.locator('[data-fv=route][aria-pressed=true]').inner_text() == 'p.o. (doustnie)'
    b.close()

assert not [e for e in errors if 'fetching the script' not in e], errors
print('Medication routes passed: translations, saved value, and legacy selection.')
