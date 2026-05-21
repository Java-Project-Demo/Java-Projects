#!/usr/bin/env bash
# Flow 3: Warehouse — create warehouse, setup layout, fetch a free bin.
set -eu
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "$SCRIPT_DIR/lib.sh"

[[ -n "${TOKEN:-}" ]] || fail "TOKEN missing — run 01_auth.sh first"

SUFFIX=$(uniq_suffix)

# ---- Create warehouse ----
step "POST /warehouse/create"
WH_BODY=$(jq -nc --arg n "TestWH-$SUFFIX" --arg a "1 Smoke Test Rd" \
  '{name:$n, address:$a}')
http POST /warehouse/create "$WH_BODY"
assert_ok

# Response may be wrapped in {data:...} or returned bare — handle both.
WAREHOUSE_ID=$(jget '.data.id // .id // empty')
[[ -n "$WAREHOUSE_ID" && "$WAREHOUSE_ID" != "null" ]] || fail "warehouse id missing (body: $HTTP_BODY)"
state_save WAREHOUSE_ID "$WAREHOUSE_ID"
ok "Warehouse created (id=$WAREHOUSE_ID)"

# ---- Setup layout ----
ZONE="A"
ROW="1"
SHELVES=2
BINS=3
step "POST /warehouse/setup-layout (zone=$ZONE row=$ROW shelves=$SHELVES bins=$BINS)"
http POST "/warehouse/setup-layout?warehouseId=${WAREHOUSE_ID}&zone=${ZONE}&row=${ROW}&shelfCount=${SHELVES}&binCount=${BINS}"
assert_status 200
ok "Layout initialized → ${SHELVES}×${BINS} = $((SHELVES*BINS)) bins"

# ---- Fetch available bins ----
step "GET /warehouse/available-bins?warehouseId=$WAREHOUSE_ID"
http GET "/warehouse/available-bins?warehouseId=${WAREHOUSE_ID}"
assert_status 200
BIN_COUNT=$(jget '.data | length')
LOCATION_ID=$(jget '.data[0].id // empty')
[[ -n "$LOCATION_ID" && "$LOCATION_ID" != "null" ]] || fail "no available bins returned"
state_save LOCATION_ID "$LOCATION_ID"
ok "Got $BIN_COUNT bin(s); using LOCATION_ID=$LOCATION_ID"
