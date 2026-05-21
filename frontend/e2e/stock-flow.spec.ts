import { test } from '@playwright/test'
import { loginAsRole, logout, showBanner, pause, isBlockedFromRoute } from './helpers'

const STOCK_USER = { id: 101, username: 'stockah' }

test('STOCK full flow demo (one session)', async ({ page }) => {
  test.setTimeout(180_000)

  /* ─────────── 1. LOGIN + đổi MK lần đầu ─────────── */
  await loginAsRole(page, STOCK_USER.id, STOCK_USER.username)

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
  await showBanner(page, '③ STOCK xem danh mục sản phẩm — chỉ đọc')
  await pause(page, 2500)

  /* ─────────── 4. KIỂM CHỨNG PHÂN QUYỀN — không vào /nhan-vien ─────────── */
  await showBanner(page, '④ Thử vào /nhan-vien — RoleRoute redirect (chỉ ADMIN)')
  const blockedFromUsers = await isBlockedFromRoute(page, '/nhan-vien')
  console.log(`  [verify] STOCK bị chặn /nhan-vien: ${blockedFromUsers ? '✓' : '✗'}`)
  await pause(page, 1500)

  /* ─────────── 5. NHẬP KHO — luồng chính ─────────── */
  await page.goto('/nhap-kho')
  await showBanner(page, '⑤ Nhập kho — chọn SP, NCC, bin, nhập IMEI')
  await pause(page, 2500)

  // Chọn sản phẩm đầu tiên trong dropdown
  const productSelect = page.locator('.ant-select').first()
  if (await productSelect.count()) {
    await productSelect.click()
    await pause(page, 1000)
    const firstOpt = page.locator('.ant-select-item-option').first()
    if (await firstOpt.count()) {
      await firstOpt.click()
      await pause(page, 1500)
    }
  }

  /* ─────────── 6. KHO VẬT LÝ — xem bản đồ ─────────── */
  await page.goto('/quan-ly-kho')
  await showBanner(page, '⑥ Quản lý kho vật lý — STOCK truy cập được')
  await pause(page, 2000)

  const mapBtn = page.locator('button:has-text("Bản đồ"), button:has-text("Map")').first()
  if (await mapBtn.count()) {
    await mapBtn.click()
    await pause(page, 3000)
    await page.keyboard.press('Escape')
    await pause(page, 800)
  }

  /* ─────────── 7. TỒN KHO CŨ ─────────── */
  await page.goto('/ton-kho-cu')
  await showBanner(page, '⑦ Tồn kho cũ — bấm Tải báo cáo')
  await pause(page, 1500)

  await page.locator('button.ant-btn-primary').first().click()
  await pause(page, 2500)

  /* ─────────── 8. TRA CỨU IMEI ─────────── */
  await page.goto('/tra-cuu-imei')
  await showBanner(page, '⑧ Tra cứu IMEI — nhập IM15002')
  await pause(page, 1000)

  await page.locator('input').first().fill('IM15002')
  await pause(page, 500)
  await page.locator('button.ant-btn-primary').first().click().catch(() => null)
  await pause(page, 3000)

  /* ─────────── 9. IN BARCODE ─────────── */
  await page.goto('/in-barcode')
  await showBanner(page, '⑨ In barcode — tiện ích cho thủ kho')
  await pause(page, 2500)

  /* ─────────── 10. KIỂM CHỨNG — không vào /thong-ke (chỉ ADMIN) ─────────── */
  await showBanner(page, '⑩ Thử vào /thong-ke — RoleRoute redirect (chỉ ADMIN)')
  const blockedFromStats = await isBlockedFromRoute(page, '/thong-ke')
  console.log(`  [verify] STOCK bị chặn /thong-ke: ${blockedFromStats ? '✓' : '✗'}`)
  await pause(page, 1500)

  /* ─────────── 11. KIỂM CHỨNG — không vào /xuat-kho (chỉ SALES) ─────────── */
  await showBanner(page, '⑪ Thử vào /xuat-kho — RoleRoute redirect (chỉ SALES)')
  const blockedFromExport = await isBlockedFromRoute(page, '/xuat-kho')
  console.log(`  [verify] STOCK bị chặn /xuat-kho: ${blockedFromExport ? '✓' : '✗'}`)
  await pause(page, 1500)

  /* ─────────── 12. LOGOUT ─────────── */
  await showBanner(page, '⑫ Đăng xuất STOCK')
  await pause(page, 800)
  await logout(page)
  await showBanner(page, '✅ HOÀN TẤT — STOCK flow demo thành công')
  await pause(page, 2500)
})
