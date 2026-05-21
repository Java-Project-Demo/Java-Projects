#!/usr/bin/env bash
# Flow 6: Reports — dashboard summary + IMEI trace.
set -eu
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "$SCRIPT_DIR/lib.sh"

[[ -n "${TOKEN:-}"  ]] || fail "TOKEN missing — run 01_auth.sh"
[[ -n "${IMEI_A:-}" ]] || fail "IMEI_A missing — run 04_import.sh"

step "GET /dashboard/summary"
http GET /dashboard/summary
assert_status 200
KEYS=$(jget '.data | keys? // [] | join(",")')
ok "Dashboard summary OK"
[[ -n "$KEYS" ]] && info "fields: $KEYS"

step "GET /dashboard/trace?imei=$IMEI_A  (sold IMEI)"
http GET "/dashboard/trace?imei=${IMEI_A}"
assert_status 200
TRACE_KEYS=$(jget '.data | keys? // [] | join(",")')
ok "Trace returned"
[[ -n "$TRACE_KEYS" ]] && info "fields: $TRACE_KEYS"

if [[ -n "${IMEI_B:-}" ]]; then
  step "GET /dashboard/trace?imei=$IMEI_B  (still in stock)"
  http GET "/dashboard/trace?imei=${IMEI_B}"
  assert_status 200
  ok "Trace returned for in-stock IMEI"
fi
