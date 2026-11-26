# Month view counts in both layouts, including dates with only a forecast.
from pathlib import Path

exec((Path(__file__).resolve().parent / 'test_newui.py').read_text().split('\nwith sync_playwright()')[0])

with sync_playwright() as pw:
    b = pw.chromium.launch(**CHROME, args=['--no-sandbox'])
    for width in (320, 390, 1400):
        p = page(b, w=width)
        dates = p.evaluate("""() => {
            const now = new Date(), date = day => +new Date(now.getFullYear(), now.getMonth() + 1, day, 12);
            const row = (id, a, day, k, f) => ({id, k, type: k, sp: a.species_id, bird: a.name, at: date(day), by: me, note: '', f});
            // Use the real calendar event builders with sample records.
            const [a, c] = D.an;
            D.rec = Array.from({length: 13}, (_, i) => row('test-' + i, a, 15, 'obs', {}));
            D.rec.push(row('inc-1', a, 14, 'incub', {days: 1}), row('inc-2', c, 14, 'incub', {days: 2}));
            if (innerWidth === 390) document.documentElement.dataset.theme = 'dark';
            [st.cy, st.cm] = dayKey(date(15)).split('-').map(Number);
            st.dk = dayKey(date(15));
            go({scr: 'cal'});
            return Object.fromEntries([14, 15, 16, 17].map(day => [day, dayKey(date(day))]));
        }""")
        day = lambda n: p.locator(f'[data-day="{dates[str(n)]}"]')
        assert day(14).locator('.cal-count').all_inner_texts() == ['2']
        assert day(15).locator('.cal-count').all_inner_texts() == ['13', '1']
        assert day(16).locator('.cal-count').all_inner_texts() == ['1']
        assert day(17).locator('.cal-count').count() == 0
        assert day(15).locator('.cal-count.recorded').get_attribute('aria-label') == 'Wpisy: 13'
        assert day(16).locator('.cal-count.expected').get_attribute('aria-label') == 'Spodziewane zdarzenia: 1'
        assert day(15).evaluate("""b => [...b.querySelectorAll('.cal-count')].every(e => {
            const cell = b.getBoundingClientRect(), count = e.getBoundingClientRect();
            return count.left >= cell.left && count.right <= cell.right && count.bottom <= cell.bottom;
        })""")
        assert day(15).evaluate("""b => {
            const [recorded, expected] = b.querySelectorAll('.cal-count');
            return recorded.offsetTop === expected.offsetTop;
        }""")
        day(16).click()
        assert p.locator('.guessrow').count() == 1
        assert p.evaluate("st.dk") == dates['16']
        shot(p, f'calendar_counts_{width}')
        p.close()
    b.close()

assert not [e for e in errors if 'fetching the script' not in e], errors
print('Calendar counts passed in both layouts with records, forecasts and empty days.')
