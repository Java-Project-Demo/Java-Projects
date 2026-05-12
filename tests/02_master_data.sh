#!/usr/bin/env bash
# Flow 2: Master data — create category, supplier, product (hasImei=true).
set -eu
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "$SCRIPT_DIR/lib.sh"

[[ -n "${TOKEN:-}" ]] || fail "TOKEN missing — run 01_auth.sh first"

SUFFIX=$(uniq_suffix)

# ---- Category ----
step "POST /category/  (create category)"
CAT_BODY=$(jq -nc --arg n "TestCat-$SUFFIX" --arg d "Smoke test category" \
  '{name:$n, description:$d}')
http POST /category/ "$CAT_BODY"
assert_ok
CATEGORY_ID=$(jget '.data.id')
[[ -n "$CATEGORY_ID" && "$CATEGORY_ID" != "null" ]] || fail "category id missing"
state_save CATEGORY_ID "$CATEGORY_ID"
ok "Category created (id=$CATEGORY_ID)"

# ---- Supplier ----
step "POST /supplier/  (create supplier)"
SUPP_BODY=$(jq -nc \
  --arg n "TestSupp-$SUFFIX" \
  --arg c "Nguyen Van A" \
  --arg p "0900000$((RANDOM % 1000))" \
  --arg e "supp-${SUFFIX}@test.local" \
  --arg a "123 Test St" \
  --arg t "TAX-$SUFFIX" \
  '{name:$n, contactPerson:$c, phoneNumber:$p, email:$e, address:$a, taxCode:$t}')
http POST /supplier/ "$SUPP_BODY"
assert_ok
SUPPLIER_ID=$(jget '.data.id')
[[ -n "$SUPPLIER_ID" && "$SUPPLIER_ID" != "null" ]] || fail "supplier id missing"
state_save SUPPLIER_ID "$SUPPLIER_ID"
ok "Supplier created (id=$SUPPLIER_ID)"

# ---- Product (with IMEI) ----
step "POST /product/  (create product with hasImei=true)"
PROD_BODY=$(jq -nc \
  --arg n "Test Phone $SUFFIX" \
  --arg s "SKU-$SUFFIX" \
  --argjson cid "$CATEGORY_ID" \
  '{
    sku: $s,
    categoryId: $cid,
    name: $n,
    priceImport: 5000000,
    priceExport: 7500000,
    hasImei: true,
    currentStock: 0,
    warrantyPeriod: 12,
    minThreshold: 5,
    specifications: "Smoke test product"
  }')
http POST /product/ "$PROD_BODY"
assert_ok
PRODUCT_ID=$(jget '.data.id')
[[ -n "$PRODUCT_ID" && "$PRODUCT_ID" != "null" ]] || fail "product id missing"
state_save PRODUCT_ID "$PRODUCT_ID"
state_save PRODUCT_SKU "SKU-$SUFFIX"
ok "Product created (id=$PRODUCT_ID, sku=SKU-$SUFFIX)"
