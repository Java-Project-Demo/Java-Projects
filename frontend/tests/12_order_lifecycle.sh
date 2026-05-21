#!/usr/bin/env bash
# Flow 12: Order list + return refund flow.
# Orders auto-COMPLETE on create when selectImeis present, so cancel test
# is a negative-path attempt against the COMPLETED order from flow 5.
set -eu
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "$SCRIPT_DIR/lib.sh"

[[ -n "${TOKEN:-}"      ]] || fail "TOKEN missing"
[[ -n "${PRODUCT_ID:-}" ]] || fail "PRODUCT_ID missing"
[[ -n "${IMEI_D:-}"     ]] || fail "IMEI_D missing"
[[ -n "${ORDER_ID:-}"   ]] || fail "ORDER_ID missing — run 05_export"

step "GET /order/?status=COMPLETED&page=0&size=20"
http GET "/order/?status=COMPLETED&page=0&size=20"
soft_check "list completed orders"

step "POST /order/create  (sell IMEI_D for refund test)"
SUFFIX=$(uniq_suffix)
BODY=$(jq -nc --argjson pid "$PRODUCT_ID" --arg imei "$IMEI_D" --arg s "$SUFFIX" \
  '{
     customerName:"Refund Test \($s)",
     customerPhone:"0922\($s|tostring|.[8:])",
     customerEmail:"refund@test.local",
     customerAddress:"x",
     paymentMethod:"CARD",
     items:[{productId:$pid, quantity:1, selectImeis:[$imei]}]
   }')
http POST /order/create "$BODY"
if soft_check "create 2nd order (IMEI_D)"; then
  REFUND_ORDER_ID=$(jget '.data.id // empty')
  state_save REFUND_ORDER_ID "$REFUND_ORDER_ID"

  step "POST /order/cancel/$REFUND_ORDER_ID  (negative — order is COMPLETED)"
  http POST "/order/cancel/$REFUND_ORDER_ID"
  if [[ "${HTTP_STATUS}" == 4* ]]; then
    ok "cancel correctly rejected (HTTP $HTTP_STATUS)"
  else
    soft_check "cancel COMPLETED order"
  fi

  step "POST /order/return/$REFUND_ORDER_ID  (refund IMEI_D)"
  http POST "/order/return/$REFUND_ORDER_ID" "$(jq -nc --arg imei "$IMEI_D" \
    '{imeis:[$imei], reason:"customer_changed_mind"}')"
  soft_check "return order"
fi

if [[ "${SOFT_FAILS:-0}" -gt 0 ]]; then
  printf "${C_YEL}  ${SOFT_FAILS} sub-step(s) failed${C_RST}\n"
fi
