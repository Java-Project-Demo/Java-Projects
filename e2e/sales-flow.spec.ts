import { test } from '@playwright/test'
import { loginAsRole, logout, showBanner, pause, isBlockedFromRoute } from './helpers'

const SALES_USER = { id: 102, username: 'salesct' }

test('SALES full flow demo (one session)', async ({ page }) => {
  test.setTimeout(180_000)

  /* ─────────── 1. LOGIN + đổi MK lần đầu ─────────── */
  await loginAsRole(page, SALES_USER.id, SALES_USER.username)

  /* ─────────── 2. DANH SÁCH SẢN PHẨM (chỉ xem) ─────────── */
  await page.goto('/vat-tu')
  await showBanner(page, '② SALES xem danh mục sản phẩm — chỉ đọc')
  await pause(page, 2500)

  /* ─────────── 3. KIỂM CHỨNG PHÂN QUYỀN — không vào /nhap-kho ─────────── */
  await showBanner(page, '③ Thử vào /nhap-kho — RoleRoute redirect (chỉ STOCK/ADMIN)')
  const blockedFromImport = await isBlockedFromRoute(page, '/nhap-kho')
  console.log(`  [verify] SALES bị chặn /nhap-kho: ${blockedFromImport ? '✓' : '✗'}`)
  await pause(page, 1500)

  /* ─────────── 4. XUẤT KHO — luồng chính của SALES ─────────── */
  await page.goto('/xuat-kho')
  await showBanner(page, '④ Xuất kho / Tạo đơn — luồng chính của SALES')
  await pause(page, 3000)

  /* ─────────── 5. LỊCH SỬ ĐƠN HÀNG — xem chi tiết (fix 2026-05-16) ─────────── */
  await page.goto('/lich-su-don-hang')
  await showBanner(page, '⑤ Lịch sử đơn — click 👁 xem chi tiết (fix mới)')
  await pause(page, 2000)

  const detailBtn = page.locator('table tbody tr').first().locator('button').first()
  if (await detailBtn.count()) {
    await detailBtn.click()
    await pause(page, 3500)
    await page.keyboard.press('Escape')
    await pause(page, 800)
  }

  /* ─────────── 6. BẢO HÀNH — bảng có sản phẩm + IMEI + KH (fix mới) ─────────── */
  await page.goto('/bao-hanh')
  await showBanner(page, '⑥ Bảo hành — bảng đầy đủ SP/IMEI/Khách (fix mới)')
  await pause(page, 2500)

  /* ─────────── 7. BẢO HÀNH — mở modal tạo phiếu với live IMEI lookup ─────────── */
  await showBanner(page, '⑦ Tạo phiếu bảo hành — gõ IMEI có live lookup')
  const createWarrantyBtn = page.locator('button:has-text("Tạo phiếu bảo hành"), button:has-text("Create")').first()
  if (await createWarrantyBtn.count()) {
    await createWarrantyBtn.click()
    await pause(page, 1500)

    const imeiInput = page.locator('.ant-modal-content input').first()
    if (await imeiInput.count()) {
      await imeiInput.fill('IM15003')
      await pause(page, 600)
      const addBtn = page.locator('.ant-modal-content button:has-text("Thêm"), .ant-modal-content button:has-text("Add")').first()
      if (await addBtn.count()) {
        await addBtn.click()
        await pause(page, 2500)
      }
    }
    // Cancel modal
    await page.locator('.ant-modal-content button').filter({ hasText: /Huỷ|Cancel/ }).first().click()
    await pause(page, 800)
  }

  /* ─────────── 8. YÊU CẦU NHẬP HÀNG ─────────── */
  await page.goto('/yeu-cau')
  await showBanner(page, '⑧ Yêu cầu nhập hàng — SALES gửi STOCK')
  await pause(page, 2500)

  /* ─────────── 9. TRA CỨU IMEI ─────────── */
  await page.goto('/tra-cuu-imei')
  await showBanner(page, '⑨ Tra cứu IMEI — nhập IM15002')
  await pause(page, 1000)

  await page.locator('input').first().fill('IM15002')
  await pause(page, 500)
  await page.locator('button.ant-btn-primary').first().click().catch(() => null)
  await pause(page, 3000)

  /* ─────────── 10. KIỂM CHỨNG — không vào /nhan-vien (chỉ ADMIN) ─────────── */
  await showBanner(page, '⑩ Thử vào /nhan-vien — RoleRoute redirect (chỉ ADMIN)')
  const blockedFromUsers = await isBlockedFromRoute(page, '/nhan-vien')
  console.log(`  [verify] SALES bị chặn /nhan-vien: ${blockedFromUsers ? '✓' : '✗'}`)
  await pause(page, 1500)

  /* ─────────── 11. KIỂM CHỨNG — không vào /kiem-ke (chỉ STOCK/ADMIN) ─────────── */
  await showBanner(page, '⑪ Thử vào /kiem-ke — RoleRoute redirect (chỉ STOCK/ADMIN)')
  const blockedFromInventory = await isBlockedFromRoute(page, '/kiem-ke')
  console.log(`  [verify] SALES bị chặn /kiem-ke: ${blockedFromInventory ? '✓' : '✗'}`)
  await pause(page, 1500)

  /* ─────────── 12. LOGOUT ─────────── */
  await showBanner(page, '⑫ Đăng xuất SALES')
  await pause(page, 800)
  await logout(page)
  await showBanner(page, '✅ HOÀN TẤT — SALES flow demo thành công')
  await pause(page, 2500)
})
