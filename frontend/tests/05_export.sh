#!/usr/bin/env bash
# Flow 5: Sales order — sell IMEI_A to a fake customer.
set -eu
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "$SCRIPT_DIR/lib.sh"

[[ -n "${TOKEN:-}"      ]] || fail "TOKEN missing — run 01_auth.sh"
[[ -n "${PRODUCT_ID:-}" ]] || fail "PRODUCT_ID missing — run 02_master_data.sh"
[[ -n "${IMEI_A:-}"     ]] || fail "IMEI_A missing — run 04_import.sh"

SUFFIX=$(uniq_suffix)

step "POST /order/create  (sell IMEI_A=$IMEI_A)"
BODY=$(jq -nc \
  --arg cn "Test Customer $SUFFIX" \
  --arg cp "0911${SUFFIX:8}" \
  --arg ce "cust-${SUFFIX}@test.local" \
  --arg ca "456 Buyer Ave" \
  --argjson pid "$PRODUCT_ID" \
  --arg imei "$IMEI_A" \
  '{
     customerName:    $cn,
     customerPhone:   $cp,
     customerEmail:   $ce,
     customerAddress: $ca,
     paymentMethod:   "CASH",
     items: [{
       productId:    $pid,
       quantity:     1,
       selectImeis: [$imei]
     }]
   }')

http POST /order/create "$BODY"
assert_ok

ORDER_ID=$(jget '.data.id // .id // empty')
ORDER_TOTAL=$(jget '.data.totalAmount // .totalAmount // empty')
ORDER_STATUS=$(jget '.data.status // .status // empty')

[[ -n "$ORDER_ID" && "$ORDER_ID" != "null" ]] || fail "order id missing (body: $HTTP_BODY)"
state_save ORDER_ID "$ORDER_ID"
ok "Order created (id=$ORDER_ID, total=$ORDER_TOTAL, status=$ORDER_STATUS)"
