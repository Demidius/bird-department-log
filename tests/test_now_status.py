# The Now counters open unique animal cards and the corresponding journal entries.
from pathlib import Path

exec((Path(__file__).resolve().parent / 'test_newui.py').read_text().split('\nwith sync_playwright()')[0])

with sync_playwright() as pw:
    browser = pw.chromium.launch(**CHROME, args=['--no-sandbox'])
    for width in (390, 1400):
        p = page(browser, w=width)
        ids = p.evaluate("""() => {
            const [a, b, c, d, child] = D.an, at = Date.now() - 60000;
            const row = (id, animal, k, f = {}) => ({id, k, type: k, sp: animal.species_id, bird: animal.name, at, by: me, note: '', f});
            D.rec = [row('rx1', a, 'tstart', {drug: 'Test A'}), row('rx2', a, 'tstart', {drug: 'Test B'}),
                row('rx3', b, 'tstart', {drug: 'Test C'}), row('unrelated-health', c, 'injury'),
                row('watch1', c, 'watch'), row('incub1', d, 'incub'),
                row('young1', d, 'hatch', {n: 2, kids: [child.name]}), row('young2', a, 'birth', {n: 1})];
            render();
            return [a.id, b.id, c.id, d.id, child.id];
        }""")
        p.locator('[data-now-status=treatment]').click()
        assert p.locator('.stack .bl-who[data-ani]').count() == 2
        p.locator(f'.stack [data-ani="{ids[0]}"]').click()
        p.wait_for_function("st.scr === 'card'")
        p.evaluate('history.back()')
        p.wait_for_function("st.scr === 'status' && st.nowStatusTab === 'animals'")
        p.locator('[data-now-status-tab=records]').click()
        assert p.locator('.stack [data-rec]').count() == 3
        assert p.locator('.stack [data-rec=unrelated-health]').count() == 0
        assert p.locator('[data-now-status]').count() == 4
        assert p.locator('[data-now-status=treatment]').get_attribute('aria-pressed') == 'true'
        p.locator('[data-now-status=incubation]').click()
        assert p.locator('[data-now-status=incubation]').get_attribute('aria-pressed') == 'true'
        assert p.locator('[data-now-status-tab=records]').get_attribute('aria-pressed') == 'true'
        assert p.locator('.stack [data-rec=incub1]').count() == 1
        p.locator('[data-now-status=treatment]').click()
        p.locator('.stack [data-rec=rx1]').click()
        p.wait_for_function("st.scr === 'rcard'")
        p.evaluate('history.back()')
        p.wait_for_function("st.scr === 'status' && st.nowStatusTab === 'records'")
        p.evaluate('history.back()')
        p.wait_for_function("st.scr === 'now'")

        for status, count in [('watch', 1), ('incubation', 1), ('young', 3)]:
            counter = p.locator(f'[data-now-status={status}]')
            assert counter.locator('b').inner_text() == str(count)
            counter.click()
            if status == 'young':
                assert p.locator(f'.stack [data-ani="{ids[4]}"]').count() == 1
                assert p.get_by_text('Młode bez kart znajdziesz we wpisach.').count() == 1
            p.locator('[data-now-status-tab=records]').click()
            assert p.locator('.stack [data-rec]').count() == (2 if status == 'young' else 1)
            p.evaluate('history.back()')
            p.wait_for_function("st.scr === 'now'")
        p.close()
    browser.close()
assert not [e for e in errors if 'fetching the script' not in e], errors
