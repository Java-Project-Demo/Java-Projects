#!/usr/bin/env bash
# Flow 15: Dashboard extras — low-stock, aging-report.
set -eu
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "$SCRIPT_DIR/lib.sh"

[[ -n "${TOKEN:-}" ]] || fail "TOKEN missing"

step "GET /dashboard/low-stock"
http GET /dashboard/low-stock
soft_check "low-stock"
COUNT=$(jget '.data | length? // 0')
info "low-stock items: $COUNT"

step "GET /dashboard/aging-report?days=30"
http GET "/dashboard/aging-report?days=30"
soft_check "aging-report 30d"

step "GET /dashboard/aging-report?days=365"
http GET "/dashboard/aging-report?days=365"
soft_check "aging-report 365d"

if [[ "${SOFT_FAILS:-0}" -gt 0 ]]; then
  printf "${C_YEL}  ${SOFT_FAILS} sub-step(s) failed${C_RST}\n"
fi
