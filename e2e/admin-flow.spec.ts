import { test, expect, Page } from '@playwright/test'

const ADMIN = { username: 'admin', password: 'admin' }
const SUFFIX = Date.now().toString().slice(-6)

const showBanner = async (page: Page, title: string) => {
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

const pause = (page: Page, ms = 1000) => page.waitForTimeout(ms)

test('ADMIN full flow demo (one session)', async ({ page }) => {
  test.setTimeout(180_000)

  /* ─────────── 1. LOGIN ─────────── */
  await page.goto('/login')
  await showBanner(page, '① Đăng nhập với admin/admin')
  await page.locator('input').first().fill(ADMIN.username)
  await page.locator('input[type="password"]').fill(ADMIN.password)
  await page.locator('button[type="submit"]').first().click()
  await page.waitForURL((u) => !u.pathname.includes('/login'), { timeout: 15_000 })
  await pause(page, 1500)

  /* ─────────── 2. DANH SÁCH SẢN PHẨM ─────────── */
  await page.goto('/vat-tu')
  await showBanner(page, '② Danh sách sản phẩm — xem trong bảng')
  await pause(page, 2500)

  /* ─────────── 3. TẠO DANH MỤC ─────────── */
  await page.goto('/danh-muc-vat-tu')
  await showBanner(page, `③ Tạo danh mục mới: "E2E Category ${SUFFIX}"`)
  await pause(page, 1200)

  const addCatBtn = page.locator('button:has-text("Thêm danh mục"), button:has-text("Add"), button.ant-btn-primary').first()
  await addCatBtn.click()
  await pause(page, 800)
  await page.locator('.ant-modal-content input').first().fill(`E2E Category ${SUFFIX}`)
  const descTa = page.locator('.ant-modal-content textarea').first()
  if (await descTa.count()) await descTa.fill('Tạo bởi Playwright E2E')
  await pause(page, 800)
  await page.locator('.ant-modal-content .ant-btn-primary').last().click()
  await pause(page, 2000)

  /* ─────────── 4. TẠO NHÀ CUNG CẤP ─────────── */
  await page.goto('/nha-cung-cap')
  await showBanner(page, `④ Tạo NCC mới: "E2E Supplier ${SUFFIX}"`)
  await pause(page, 1200)

  await page.locator('button.ant-btn-primary').first().click()
  await pause(page, 800)
  const modalInputs = page.locator('.ant-modal-content input')
  await modalInputs.nth(0).fill(`E2E Supplier ${SUFFIX}`)
  if ((await modalInputs.count()) > 1) await modalInputs.nth(1).fill('Người Liên Hệ E2E')
  if ((await modalInputs.count()) > 2) await modalInputs.nth(2).fill('0900000000')
  await pause(page, 800)
  await page.locator('.ant-modal-content .ant-btn-primary').last().click()
  await pause(page, 2000)

  /* ─────────── 5. BẢN ĐỒ KHO ─────────── */
  await page.goto('/quan-ly-kho')
  await showBanner(page, '⑤ Bản đồ kho — mở Drawer xem layout bin có sản phẩm')
  await pause(page, 1500)

  const mapBtn = page.locator('button:has-text("Bản đồ"), button:has-text("Map")').first()
  if (await mapBtn.count()) {
    await mapBtn.click()
    await pause(page, 3500)
    await page.keyboard.press('Escape')
    await pause(page, 800)
  }

  /* ─────────── 6. LỊCH SỬ ĐƠN HÀNG (verify fix mới) ─────────── */
  await page.goto('/lich-su-don-hang')
  await showBanner(page, '⑥ Lịch sử đơn hàng — click 👁 xem chi tiết (fix 2026-05-16)')
  await pause(page, 1500)

  const detailBtn = page.locator('table tbody tr').first().locator('button').first()
  if (await detailBtn.count()) {
    await detailBtn.click()
    await pause(page, 3500)
    await page.keyboard.press('Escape')
    await pause(page, 800)
  }

  /* ─────────── 7. BẢO HÀNH (verify cột mới) ─────────── */
  await page.goto('/bao-hanh')
  await showBanner(page, '⑦ Bảo hành — bảng có cột Sản phẩm + IMEI + Khách hàng (fix mới)')
  await pause(page, 3000)

  /* ─────────── 8. TỒN KHO CŨ — modal lý do hỏng (fix mới) ─────────── */
  await page.goto('/ton-kho-cu')
  await showBanner(page, '⑧ Tồn kho cũ — bấm "Tải báo cáo"')
  await pause(page, 1500)

  const loadBtn = page.locator('button.ant-btn-primary').first()
  await loadBtn.click()
  await pause(page, 2000)

  const damageBtn = page.locator('button:has-text("Đánh dấu hỏng"), button:has-text("Mark damaged")').first()
  if (await damageBtn.count()) {
    await showBanner(page, '⑧ Modal yêu cầu nhập LÝ DO HỎNG (fix mới)')
    await damageBtn.click()
    await pause(page, 1500)

    const reasonField = page.locator('.ant-modal-content textarea').last()
    if (await reasonField.count()) {
      await reasonField.fill('Test E2E: Màn hình vỡ do va đập')
      await pause(page, 2000)
    }
    await page.locator('.ant-modal-content button').filter({ hasText: /Huỷ|Cancel/ }).first().click()
    await pause(page, 800)
  }

  /* ─────────── 9. NHÂN VIÊN (chỉ ADMIN) ─────────── */
  await page.goto('/nhan-vien')
  await showBanner(page, '⑨ Quản lý nhân viên (chỉ ADMIN truy cập được)')
  await pause(page, 2500)

  /* ─────────── 10. THỐNG KÊ ─────────── */
  await page.goto('/thong-ke')
  await showBanner(page, '⑩ Thống kê / Dashboard — chart, KPI, doanh thu')
  await pause(page, 3500)

  /* ─────────── 11. TRA CỨU IMEI ─────────── */
  await page.goto('/tra-cuu-imei')
  await showBanner(page, '⑪ Tra cứu IMEI — nhập "IM15002"')
  await pause(page, 1000)

  const traceInput = page.locator('input').first()
  await traceInput.fill('IM15002')
  await pause(page, 500)
  const traceBtn = page.locator('button.ant-btn-primary').first()
  if (await traceBtn.count()) await traceBtn.click().catch(() => null)
  else await page.keyboard.press('Enter')
  await pause(page, 3000)

  /* ─────────── 12. ĐĂNG XUẤT ─────────── */
  await page.goto('/')
  await showBanner(page, 'Bước 12: Đăng xuất khỏi hệ thống')
  await pause(page, 1200)
  // Remove banner before clicking avatar to avoid text-match collision
  await page.evaluate(() => document.getElementById('__e2e_banner')?.remove())

  const avatar = page.locator('.ant-avatar').first()
  if (await avatar.count()) {
    await avatar.click()
    await pause(page, 800)
    const logout = page.locator('.ant-dropdown-menu-item').filter({ hasText: /Đăng xuất|Logout/i }).first()
    if (await logout.count()) {
      await logout.click()
      await pause(page, 2000)
    }
  }

  await showBanner(page, '✅ HOÀN TẤT — 12 bước demo ADMIN thành công')
  await pause(page, 2500)
})
