import { Page, APIRequestContext, request, expect } from '@playwright/test'

export const API_BASE = 'http://localhost:8888/api/v1'
export const TEST_PASSWORD = 'TestPass123!'

export const showBanner = async (page: Page, title: string) => {
  console.log(`\n┌─────────────────────────────────────────────────────────`)
  console.log(`│ ${title}`)
  console.log(`└─────────────────────────────────────────────────────────`)
  await page.evaluate((t) => {
    let el = document.getElementById('__e2e_banner')
    if (!el) {
      el = document.createElement('div')
      el.id = '__e2e_banner'
      el.style.cssText =
        'position:fixed;top:12px;right:12px;z-index:99999;' +
        'background:#E8603C;color:#fff;padding:10px 16px;border-radius:8px;' +
        'font-weight:700;font-size:13px;box-shadow:0 4px 12px rgba(0,0,0,.2);' +
        'max-width:380px;font-family:system-ui;pointer-events:none'
      document.body.appendChild(el)
    }
    el.textContent = t
  }, title)
}

export const pause = (page: Page, ms = 1000) => page.waitForTimeout(ms)

export const clearBanner = (page: Page) =>
  page.evaluate(() => document.getElementById('__e2e_banner')?.remove())

interface AdminApi {
  ctx: APIRequestContext
  token: string
}

export const adminApi = async (): Promise<AdminApi> => {
  const ctx = await request.newContext()
  const res = await ctx.post(`${API_BASE}/auth/login`, {
    data: { username: 'admin', password: 'admin' },
    headers: { 'Content-Type': 'application/json' },
  })
  if (!res.ok()) {
    throw new Error(`Admin login failed: HTTP ${res.status()} — ${await res.text().then((t) => t.slice(0, 200))}`)
  }
  const json = await res.json()
  const token = json?.data?.accessToken
  if (!token) throw new Error(`Cannot obtain admin token: ${JSON.stringify(json)}`)
  return { ctx, token }
}

export const resetPassword = async (api: AdminApi, userId: number): Promise<string> => {
  const res = await api.ctx.put(`${API_BASE}/auth/${userId}/reset-password`, {
    headers: { Authorization: `Bearer ${api.token}` },
  })
  if (!res.ok()) {
    throw new Error(`Reset password failed for ${userId}: HTTP ${res.status()}`)
  }
  const json = await res.json()
  const tempPass = json?.data
  if (!tempPass) throw new Error(`Cannot reset password for user ${userId}: ${JSON.stringify(json)}`)
  return tempPass
}

/**
 * Login as role user. Admin API resets password first then UI logs in.
 * Handles isPasswordReset=true redirect by setting TEST_PASSWORD.
 */
export const loginAsRole = async (
  page: Page,
  userId: number,
  username: string,
): Promise<void> => {
  const api = await adminApi()
  const tempPass = await resetPassword(api, userId)
  console.log(`  [setup] Reset password for ${username} (id=${userId}) → temp="${tempPass.slice(0, 4)}***"`)

  await page.goto('/login')
  await showBanner(page, `① Đăng nhập ${username} với MK tạm`)
  await page.locator('input').first().fill(username)
  await page.locator('input[type="password"]').fill(tempPass)
  await page.locator('button[type="submit"]').first().click()

  // Wait for either dashboard or /change-password redirect
  await page.waitForURL(/(\/$|\/change-password)/, { timeout: 15_000 })
  await pause(page, 1500)

  if (page.url().includes('/change-password')) {
    await showBanner(page, '① Đổi mật khẩu lần đầu (bắt buộc)')
    const passwords = page.locator('input[type="password"]')
    // 3 fields: current, new, confirm
    const count = await passwords.count()
    if (count >= 3) {
      await passwords.nth(0).fill(tempPass)
      await passwords.nth(1).fill(TEST_PASSWORD)
      await passwords.nth(2).fill(TEST_PASSWORD)
    } else if (count === 2) {
      await passwords.nth(0).fill(TEST_PASSWORD)
      await passwords.nth(1).fill(TEST_PASSWORD)
    }
    await pause(page, 800)
    await page.locator('button[type="submit"], button.ant-btn-primary').first().click()
    await page.waitForURL((u) => !u.pathname.includes('/change-password'), { timeout: 10_000 })
    await pause(page, 1500)
  }
}

export const logout = async (page: Page) => {
  await page.goto('/')
  await pause(page, 800)
  await clearBanner(page)

  const avatar = page.locator('.ant-avatar').first()
  if (await avatar.count()) {
    await avatar.click()
    await pause(page, 800)
    const logoutItem = page
      .locator('.ant-dropdown-menu-item')
      .filter({ hasText: /Đăng xuất|Logout/i })
      .first()
    if (await logoutItem.count()) {
      await logoutItem.click()
      await pause(page, 1500)
    }
  }
}

/**
 * Verify user is BLOCKED from a route. RoleRoute renders <Result status="403">
 * — URL stays at path but page content shows 403.
 * Returns true if blocked, false if allowed.
 */
export const isBlockedFromRoute = async (page: Page, path: string): Promise<boolean> => {
  await page.goto(path)
  await pause(page, 1500)
  const forbidden = page.locator('.ant-result-403, .ant-result-title:has-text("403")').first()
  return (await forbidden.count()) > 0
}

export { expect }
