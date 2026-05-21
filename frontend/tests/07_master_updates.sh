#!/usr/bin/env bash
# Flow 7: Master data updates — category, supplier, product PUT endpoints.
set -eu
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "$SCRIPT_DIR/lib.sh"

[[ -n "${TOKEN:-}"        ]] || fail "TOKEN missing"
[[ -n "${CATEGORY_ID:-}"  ]] || fail "CATEGORY_ID missing"
[[ -n "${SUPPLIER_ID:-}"  ]] || fail "SUPPLIER_ID missing"
[[ -n "${PRODUCT_ID:-}"   ]] || fail "PRODUCT_ID missing"

step "GET /category/$CATEGORY_ID"
http GET "/category/$CATEGORY_ID"
soft_check "category by id"

step "PUT /category/$CATEGORY_ID  (rename)"
http PUT "/category/$CATEGORY_ID" "$(jq -nc --arg n "Renamed-Cat-$(uniq_suffix)" '{name:$n, description:"updated"}')"
soft_check "category update"

step "PUT /supplier/$SUPPLIER_ID  (update)"
http PUT "/supplier/$SUPPLIER_ID" "$(jq -nc --arg n "Renamed-Supp-$(uniq_suffix)" \
  '{name:$n, contactPerson:"Updated", phoneNumber:"0900111222", email:"upd@test.local",
    address:"new addr", taxCode:"TAX-UPD", status:"ACTIVE", isDeleted:false}')"
soft_check "supplier update"

step "GET /product/$PRODUCT_ID"
http GET "/product/$PRODUCT_ID"
soft_check "product by id"

step "PUT /product/$PRODUCT_ID  (raise priceExport)"
http PUT "/product/$PRODUCT_ID" "$(jq -nc --argjson cid "$CATEGORY_ID" --arg sku "${PRODUCT_SKU:-SKU-X}" \
  '{
    sku:$sku, categoryId:$cid, name:"Updated Product",
    priceImport:5000000, priceExport:9000000, hasImei:true,
    currentStock:5, warrantyPeriod:12, minThreshold:5,
    specifications:"updated", status:"ACTIVE", isDeleted:false
  }')"
soft_check "product update"

if [[ "${SOFT_FAILS:-0}" -gt 0 ]]; then
  printf "${C_YEL}  ${SOFT_FAILS} sub-step(s) failed${C_RST}\n"
fi
