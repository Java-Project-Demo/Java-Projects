#!/usr/bin/env bash
# Flow 11: Mark item damaged, return product back to stock.
set -eu
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "$SCRIPT_DIR/lib.sh"

[[ -n "${TOKEN:-}"  ]] || fail "TOKEN missing"
[[ -n "${IMEI_C:-}" ]] || fail "IMEI_C missing — run 04_import"

step "POST /stock/mark-damaged  (IMEI_C, reason=screen)"
http POST "/stock/mark-damaged?imei=${IMEI_C}&reason=screen_broken"
soft_check "mark damaged"

step "POST /stock/return-product  (IMEI_C back to stock, reason=fixed)"
http POST "/stock/return-product?imei=${IMEI_C}&reason=fixed_in_warranty"
soft_check "return product"

step "GET /dashboard/trace?imei=$IMEI_C  (should show status changes)"
http GET "/dashboard/trace?imei=$IMEI_C"
soft_check "trace damaged item"

if [[ "${SOFT_FAILS:-0}" -gt 0 ]]; then
  printf "${C_YEL}  ${SOFT_FAILS} sub-step(s) failed${C_RST}\n"
fi
