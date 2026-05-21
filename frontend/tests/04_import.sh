#!/usr/bin/env bash
# Flow 4: Import stock — bring 2 IMEIs into the warehouse for the test product.
set -eu
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "$SCRIPT_DIR/lib.sh"

[[ -n "${TOKEN:-}"        ]] || fail "TOKEN missing — run 01_auth.sh first"
[[ -n "${PRODUCT_ID:-}"   ]] || fail "PRODUCT_ID missing — run 02_master_data.sh"
[[ -n "${SUPPLIER_ID:-}"  ]] || fail "SUPPLIER_ID missing — run 02_master_data.sh"
[[ -n "${LOCATION_ID:-}"  ]] || fail "LOCATION_ID missing — run 03_warehouse.sh"

SUFFIX=$(uniq_suffix)
IMEI_A="IMEI-${SUFFIX}-A"
IMEI_B="IMEI-${SUFFIX}-B"
IMEI_C="IMEI-${SUFFIX}-C"
IMEI_D="IMEI-${SUFFIX}-D"
IMEI_E="IMEI-${SUFFIX}-E"

step "POST /stock/import  (productId=$PRODUCT_ID, 5 IMEIs)"
BODY=$(jq -nc \
  --argjson pid "$PRODUCT_ID" \
  --argjson lid "$LOCATION_ID" \
  --argjson sid "$SUPPLIER_ID" \
  --arg a "$IMEI_A" --arg b "$IMEI_B" --arg c "$IMEI_C" \
  --arg d "$IMEI_D" --arg e "$IMEI_E" \
  '{
     productId:  $pid,
     locationId: $lid,
     supplierId: $sid,
     costPrice:  5000000,
     imeiList:  [$a, $b, $c, $d, $e]
   }')

http POST /stock/import "$BODY"
assert_ok

NEW_STOCK=$(jget '.data.currentStock // empty')
state_save IMEI_A "$IMEI_A"
state_save IMEI_B "$IMEI_B"
state_save IMEI_C "$IMEI_C"
state_save IMEI_D "$IMEI_D"
state_save IMEI_E "$IMEI_E"
ok "Imported 5 IMEIs → currentStock=$NEW_STOCK"
info "Roles: A=sell B=move C=damage D=cancel E=warranty"
