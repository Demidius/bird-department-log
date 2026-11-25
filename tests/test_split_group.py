# Separate birds in a group from both layouts, including stale data and the last member.
import pathlib

exec((pathlib.Path(__file__).resolve().parent / 'test_newui.py').read_text().split('with sync_playwright() as pw:')[0])

GROUP = """() => {
    const db = __mock.db, bird = db.species.find(s => s.info.group === 'bird');
    const a = db.collection.find(a => a.species_id === bird.id), id = crypto.randomUUID(), now = new Date().toISOString();
    __mock.db.collection.push({...a, id, name: 'Test flock', grp: {m: 2, f: 1, u: 1, j: 2}, updated_at: now});
    __mock.db.records.push({id: crypto.randomUUID(), type: 'expo', bird: 'Test flock', f: {to: 'Test enclosure'}, event_at: now});
    return id;
}"""

with sync_playwright() as pw:
    b = pw.chromium.launch(**CHROME, args=['--no-sandbox'])
    for width in (390, 1400):
        p = page(b, w=width)
        group = p.evaluate(GROUP)
        p.evaluate(f"async () => {{ await LOAD.collection(); await LOAD.records(); lang = 'ru'; go({{scr:'card', ani:'{group}'}}); }}")
        p.get_by_role('button', name='Отделить', exact=True).click()
        dialog = p.get_by_role('dialog', name='Отделить')
        assert dialog.get_by_role('checkbox').count() == 6
        assert dialog.locator('[data-split-save]').is_disabled()
        p.evaluate('history.back()')
        dialog.wait_for(state='hidden')
        assert p.locator('[data-split-open]').is_visible()

        p.locator('[data-split-open]').click()
        dialog.get_by_label('Самец 2').check()
        dialog.get_by_label('Молодая птица 1').check()
        assert dialog.get_by_label('Самец 2').is_checked()
        assert dialog.get_by_label('Самец 1').is_checked() is False
        shot(p, f'split_{width}')
        count = p.evaluate('__mock.db.collection.length')
        p.get_by_role('button', name='Отделить (2)').click()
        dialog.wait_for(state='hidden')
        after = p.evaluate("(id) => __mock.db.collection.find(a => a.id === id)", group)
        assert after['grp'] == {'m': 1, 'f': 1, 'u': 1, 'j': 1}
        created = p.evaluate(f'__mock.db.collection.slice({count})')
        assert len(created) == 2
        assert [a['sex'] for a in created] == ['m', '']
        assert created[1]['age_class'] == 'young'
        assert all(a['grp'] is None and a['encl'] == 'Test enclosure' for a in created)

        p.locator('[data-split-open]').click()
        dialog.get_by_label('Самка 1').check()
        p.evaluate("(id) => __mock.db.collection.find(a => a.id === id).updated_at = 'changed'", group)
        dialog.locator('[data-split-save]').click()
        assert 'Группа изменилась' in dialog.get_by_role('alert').inner_text()
        assert dialog.locator('[data-split-save]').is_disabled()
        dialog.get_by_role('button', name='Закрыть').click()
        p.locator('[data-split-open]').click()
        for i in range(4):
            dialog.get_by_role('checkbox').nth(i).check()
        assert 'Пустая группа' in dialog.inner_text()
        dialog.locator('[data-split-save]').click()
        dialog.wait_for(state='hidden')
        assert p.evaluate("(id) => __mock.db.collection.find(a => a.id === id).status", group) == 'out'
        assert p.locator('[data-split-open]').count() == 0

        unknown = p.evaluate(GROUP)
        p.evaluate("id => { const a = __mock.db.collection.find(a => a.id === id); a.grp = {unk:true}; }", unknown)
        p.evaluate(f"async () => {{ await LOAD.collection(); go({{scr:'card', ani:'{unknown}'}}); }}")
        p.locator('[data-split-open]').click()
        assert dialog.get_by_role('checkbox').count() == 0
        dialog.get_by_role('button', name='Изменить состав').click()
        assert p.locator('[data-gunk]').is_visible()
        p.close()
    b.close()
assert not [e for e in errors if e != 'An unknown error occurred when fetching the script.'], errors
print('Group separation passed on phone and desktop')
