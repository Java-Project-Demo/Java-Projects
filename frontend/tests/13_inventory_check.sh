#!/usr/bin/env bash
# Flow 13: Inventory check — start, scan, complete.
set -eu
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "$SCRIPT_DIR/lib.sh"

[[ -n "${TOKEN:-}"       ]] || fail "TOKEN missing"
[[ -n "${IMEI_E:-}"      ]] || fail "IMEI_E missing"
[[ -n "${LOCATION_ID:-}" ]] || fail "LOCATION_ID missing"

step "POST /inventory/start"
http POST /inventory/start
if ! soft_check "start session"; then
  exit 0
fi
SESSION_ID=$(jget '.data.id // .data // empty')
[[ -n "$SESSION_ID" && "$SESSION_ID" != "null" ]] || { printf "${C_YEL}  ⚠ session id missing${C_RST}\n"; exit 0; }
info "sessionId=$SESSION_ID"

step "POST /inventory/scan?sessionId=$SESSION_ID&imei=$IMEI_E&actualLocId=$LOCATION_ID"
http POST "/inventory/scan?sessionId=${SESSION_ID}&imei=${IMEI_E}&actualLocId=${LOCATION_ID}"
soft_check "scan IMEI_E"

step "POST /inventory/complete?sessionId=$SESSION_ID"
http POST "/inventory/complete?sessionId=${SESSION_ID}"
soft_check "complete session"

if [[ "${SOFT_FAILS:-0}" -gt 0 ]]; then
  printf "${C_YEL}  ${SOFT_FAILS} sub-step(s) failed${C_RST}\n"
fi
