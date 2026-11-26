# Daily supplemental feeding, for an incubation or as its own record.
from datetime import datetime, timezone
from pathlib import Path

exec((Path(__file__).resolve().parent / 'test_newui.py').read_text().split('\nwith sync_playwright()')[0])

def fixed_time(page, day, hour, minute=0, refresh='render()'):
    local_ms = page.evaluate("([d, h, m]) => new Date(2026, 10, d, h, m).getTime()", [day, hour, minute])
    page.clock.set_fixed_time(datetime.fromtimestamp(local_ms / 1000, timezone.utc))
    page.evaluate(refresh)

def open_form(page, animal, kind):
    page.evaluate("id => go({scr: 'card', ani: id})", animal)
    page.locator('[data-add=an]').click()
    page.locator(f'[data-kind={kind}]').click()

with sync_playwright() as pw:
    browser = pw.chromium.launch(**CHROME, args=['--no-sandbox'])
    p = page(browser)
    ids = p.evaluate("""() => {
        const birds = D.an.filter(a => !a.grp && !isMammal(spBy(a.species_id)));
        D.rec = []; __mock.db.records.length = 0;
        return birds.slice(0, 3).map(a => a.id);
    }""")
    fixed_time(p, 26, 12)
    open_form(p, ids[0], 'incub')
    toggle = p.get_by_role('checkbox', name='Dodatkowe karmienie')
    assert not toggle.is_checked()
    assert p.locator('[data-feed-count]').count() == 0
    toggle.click()
    p.locator('[data-feed-count]').fill('3')
    inputs = p.locator('[data-feed-time-input]')
    assert inputs.count() == 3
    for i, value in enumerate(['12:00', '12:00', '16:00']):
        inputs.nth(i).fill(value)
    p.locator('[data-save]').click()
    assert p.get_by_text('Podaj od 1 do 24 karmień i inną godzinę dla każdego.').count() == 1
    inputs.nth(1).fill('13:30')
    shot(p, 'feeding_incubation')
    p.locator('[data-save]').click()
    p.wait_for_function("D.rec.some(r => r.k === 'incub' && r.f.feedTimes?.length === 3)")
    assert p.evaluate("D.rec.find(r => r.k === 'incub').f.feedTimes") == ['12:00', '13:30', '16:00']

    p.evaluate("go({scr: 'now'})")
    p.locator('[data-feed-give][data-feed-time="12:00"]').click()
    p.wait_for_function("D.rec.some(r => r.k === 'feed_given')")
    assert p.locator('[data-feed-give][data-feed-time="12:00"]').count() == 0
    assert p.get_by_text('Podać o 13:30').count() == 1
    p.evaluate("""async () => {
        const plan = D.rec.find(r => r.k === 'incub');
        await Promise.all([saveFeedingAction(plan.id, ymd(Date.now()), '12:00', false),
            saveFeedingAction(plan.id, ymd(Date.now()), '12:00', false)]);
    }""")
    assert p.evaluate("D.rec.filter(r => r.k === 'feed_given').length") == 1
    fixed_time(p, 26, 13, 5, 'refreshFeedingTasks()')
    p.locator('[data-feed-give][data-feed-time="13:30"]').click()
    p.wait_for_function("D.rec.filter(r => r.k === 'feed_given').length === 2")
    assert p.get_by_text('Podać o 16:00').count() == 1
    shot(p, 'feeding_now')
    fixed_time(p, 27, 12)
    assert p.locator('[data-feed-give][data-feed-time="12:00"]').count() == 1

    p.evaluate("""async id => {
        const a = anById(id), plan = D.rec.find(r => r.k === 'incub');
        await addRecord('hatch', a.name, a.species_id, {par: [plan.bird]}, '');
        render();
    }""", ids[2])
    assert p.locator('[data-feed-give]').count() == 0
    assert p.get_by_text('Podać o 16:00').count() == 0

    open_form(p, ids[1], 'feed')
    assert p.locator('[data-feed-toggle]').count() == 0
    p.locator('[data-feed-time-input]').fill('12:10')
    p.locator('[data-save]').click()
    p.wait_for_function("D.rec.some(r => r.k === 'feed')")
    p.evaluate("go({scr: 'now'})")
    assert p.locator('[data-feed-give][data-feed-time="12:10"]').count() == 1
    p.get_by_role('button', name='Dodatkowe karmienie').click()
    p.locator('[data-feed-stop]').click()
    p.wait_for_function("D.rec.some(r => r.k === 'feed_end')")
    assert p.locator('[data-feed-stop]').count() == 0
    p.evaluate("go({scr: 'now'})")
    assert p.locator('[data-feed-give]').count() == 0
    browser.close()

assert not [e for e in errors if 'fetching the script' not in e], errors
print('Supplemental feeding passed: form, daily slots, hatch, standalone plan and stopping.')
