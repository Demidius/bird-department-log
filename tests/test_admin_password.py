# Administrator saves a password from the actual form and waits for server confirmation.
from pathlib import Path

exec((Path(__file__).resolve().parent / 'test_newui.py').read_text().split('\nwith sync_playwright()')[0])

with sync_playwright() as pw:
    browser = pw.chromium.launch(**CHROME, args=['--no-sandbox'])
    p = page(browser)
    p.evaluate("go({scr: 'users'})")
    p.locator('[data-uform=new]').click()
    p.locator('[data-uin=name]').fill('Sample staff')
    p.locator('[data-uin=login]').fill('sample-staff')
    p.locator('[data-uin=pass]').fill('MockOriginal!23')
    p.locator('[data-usave]').click()
    p.locator('.creds').get_by_text('MockOriginal!23').wait_for()  # sign-in details window (ux3.js 8)
    p.locator('.credsh [data-ccclose]').first.click()
    staff = p.locator('button[data-uform]').filter(has_text='sample-staff')
    staff.click()

    new_password = '00MockReplacement!25'
    field = p.locator('[data-uin=pass]')
    assert field.get_attribute('type') == 'password'
    assert p.locator('.bl-sheet').get_by_text('sample-staff', exact=True).is_visible()
    field.evaluate('(el, value) => { el.value = value; }', new_password)
    assert p.evaluate("st.uform.pass === ''")
    p.evaluate("""() => {
      window.mockAdminInvoke = sb.functions.invoke;
      sb.functions.invoke = async () => ({data: {ok: true}, error: null});
    }""")
    p.locator('[data-usave]').click()
    p.locator('.bl-sheet [role=alert]').get_by_text('Serwer nie potwierdził zmiany hasła.').wait_for()
    assert field.evaluate('(el, value) => el.value === value', new_password)
    p.evaluate("() => { sb.functions.invoke = window.mockAdminInvoke; }")
    p.locator('[data-usave]').click()
    p.locator('#toast').get_by_text('Hasło zmienione. Login: sample-staff').wait_for()
    assert not p.locator('[data-uin=pass]').count()
    p.locator('.creds').get_by_text(new_password).wait_for()
    p.locator('.credsh [data-ccclose]').first.click()

    staff.click()
    p.locator('[data-uin=name]').fill('Sample staff renamed')
    p.locator('[data-usave]').click()
    p.locator('button[data-uform]').filter(has_text='Sample staff renamed').wait_for()
    p.evaluate("sb.auth.signOut()")
    p.locator('#lgl').fill('sample-staff')
    p.locator('#lgp').fill('MockOriginal!23')
    p.locator('#loginf button[type=submit]').click()
    p.locator('#lge').get_by_text('Zły login lub hasło').wait_for()
    p.locator('#lgp').fill(new_password)
    p.locator('#loginf button[type=submit]').click()
    p.wait_for_function("st.gate === 'app' && myProfile.login === 'sample-staff'")
    browser.close()

assert not [e for e in errors if 'fetching the script' not in e], errors
print('Admin password confirmed, profile-only save preserved it, and only the new password signs in.')
