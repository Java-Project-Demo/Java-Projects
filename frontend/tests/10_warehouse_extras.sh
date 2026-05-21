#!/usr/bin/env bash
# Flow 10: Warehouse map + move-item.
set -eu
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "$SCRIPT_DIR/lib.sh"

[[ -n "${TOKEN:-}"        ]] || fail "TOKEN missing"
[[ -n "${WAREHOUSE_ID:-}" ]] || fail "WAREHOUSE_ID missing"
[[ -n "${IMEI_B:-}"       ]] || fail "IMEI_B missing"

step "GET /warehouse/map"
http GET /warehouse/map
soft_check "warehouse map"

step "GET /warehouse/available-bins?warehouseId=$WAREHOUSE_ID"
http GET "/warehouse/available-bins?warehouseId=$WAREHOUSE_ID"
soft_check "available bins"
# Pick a bin different from LOCATION_ID (used during import)
TARGET_LOC=$(jget --argjson cur "${LOCATION_ID:-0}" '.data | map(select(.id != $cur)) | .[0].id // empty')

if [[ -n "$TARGET_LOC" && "$TARGET_LOC" != "null" ]]; then
  step "POST /warehouse/move-item  (move IMEI_B → bin $TARGET_LOC)"
  http POST "/warehouse/move-item?imei=${IMEI_B}&targetLocId=${TARGET_LOC}"
  soft_check "move-item"
else
  printf "${C_YEL}  ⚠ no alternate bin to move to${C_RST}\n"
fi

if [[ "${SOFT_FAILS:-0}" -gt 0 ]]; then
  printf "${C_YEL}  ${SOFT_FAILS} sub-step(s) failed${C_RST}\n"
fi
