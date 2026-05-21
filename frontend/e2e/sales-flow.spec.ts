import { test } from '@playwright/test'
import { loginAsRole, logout, showBanner, pause, isBlockedFromRoute } from './helpers'

const SALES_USER = { id: 102, username: 'salesct' }

test('SALES full flow demo (one session)', async ({ page }) => {
  test.setTimeout(180_000)

  /* ─────────── 1. LOGIN + đổi MK lần đầu ─────────── */
  await loginAsRole(page, SALES_USER.id, SALES_USER.username)

  /* ─────────── 2. DASHBOARD MỚI — chart phân bổ danh mục ─────────── */
  await page.goto('/')
  await showBanner(page, '② Dashboard mới — donut Top 6 + "Khác", legend list scroll bên phải')
  await pause(page, 1500)

  const pieCard = page.locator('.ant-card-head-title:has-text("Phân bổ")').first()
  if (await pieCard.count()) {
    await pieCard.scrollIntoViewIfNeeded()
    await pause(page, 3500)
  } else {
    await pause(page, 2500)
  }

  /* ─────────── 3. DANH SÁCH SẢN PHẨM (chỉ xem) ─────────── */
  await page.goto('/vat-tu')
  await showBanner(page, '③ SALES xem danh mục sản phẩm — chỉ đọc')
  await pause(page, 2500)

  /* ─────────── 4. KIỂM CHỨNG PHÂN QUYỀN — không vào /nhap-kho ─────────── */
  await showBanner(page, '④ Thử vào /nhap-kho — RoleRoute redirect (chỉ STOCK/ADMIN)')
  const blockedFromImport = await isBlockedFromRoute(page, '/nhap-kho')
  console.log(`  [verify] SALES bị chặn /nhap-kho: ${blockedFromImport ? '✓' : '✗'}`)
  await pause(page, 1500)

  /* ─────────── 5. XUẤT KHO — luồng chính của SALES ─────────── */
  await page.goto('/xuat-kho')
  await showBanner(page, '⑤ Xuất kho / Tạo đơn — luồng chính của SALES')
  await pause(page, 3000)

  /* ─────────── 6. LỊCH SỬ ĐƠN HÀNG — xem chi tiết (fix 2026-05-16) ─────────── */
  await page.goto('/lich-su-don-hang')
  await showBanner(page, '⑥ Lịch sử đơn — click 👁 xem chi tiết (fix mới)')
  await pause(page, 2000)

  const detailBtn = page.locator('table tbody tr').first().locator('button').first()
  if (await detailBtn.count()) {
    await detailBtn.click()
    await pause(page, 3500)
    await page.keyboard.press('Escape')
    await pause(page, 800)
  }

  /* ─────────── 7. TRA CỨU IMEI ─────────── */
  await page.goto('/tra-cuu-imei')
  await showBanner(page, '⑦ Tra cứu IMEI — nhập IM15002')
  await pause(page, 1000)

  await page.locator('input').first().fill('IM15002')
  await pause(page, 500)
  await page.locator('button.ant-btn-primary').first().click().catch(() => null)
  await pause(page, 3000)

  /* ─────────── 8. KIỂM CHỨNG — không vào /nhan-vien (chỉ ADMIN) ─────────── */
  await showBanner(page, '⑧ Thử vào /nhan-vien — RoleRoute redirect (chỉ ADMIN)')
  const blockedFromUsers = await isBlockedFromRoute(page, '/nhan-vien')
  console.log(`  [verify] SALES bị chặn /nhan-vien: ${blockedFromUsers ? '✓' : '✗'}`)
  await pause(page, 1500)

  /* ─────────── 9. KIỂM CHỨNG — không vào /quan-ly-kho (chỉ STOCK/ADMIN) ─────────── */
  await showBanner(page, '⑨ Thử vào /quan-ly-kho — RoleRoute redirect (chỉ STOCK/ADMIN)')
  const blockedFromWarehouse = await isBlockedFromRoute(page, '/quan-ly-kho')
  console.log(`  [verify] SALES bị chặn /quan-ly-kho: ${blockedFromWarehouse ? '✓' : '✗'}`)
  await pause(page, 1500)

  /* ─────────── 10. LOGOUT ─────────── */
  await showBanner(page, '⑩ Đăng xuất SALES')
  await pause(page, 800)
  await logout(page)
  await showBanner(page, '✅ HOÀN TẤT — SALES flow demo thành công')
  await pause(page, 2500)
})
