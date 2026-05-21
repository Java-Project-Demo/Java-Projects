#!/usr/bin/env bash
# Flow 14: Warranty — create claim on a sold IMEI, walk through statuses.
set -eu
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "$SCRIPT_DIR/lib.sh"

[[ -n "${TOKEN:-}"  ]] || fail "TOKEN missing"
[[ -n "${IMEI_A:-}" ]] || fail "IMEI_A missing — run 04+05"

step "GET /warranty/  (list)"
http GET /warranty/
soft_check "list warranty claims"

step "POST /warranty/create  (IMEI_A, screen issue)"
http POST /warranty/create "$(jq -nc --arg imei "$IMEI_A" '{imeis:[$imei], issue:"Screen flicker after 1 month"}')"
if soft_check "create warranty claim"; then
  CLAIM_ID=$(jget '.data[0].id // .data.id // empty')
  state_save CLAIM_ID "$CLAIM_ID"
  info "claimId=$CLAIM_ID"
fi

if [[ -n "${CLAIM_ID:-}" && "$CLAIM_ID" != "null" ]]; then
  step "GET /warranty/$CLAIM_ID"
  http GET "/warranty/$CLAIM_ID"
  soft_check "get claim by id"

  for STATUS in FIXING FIXED RETURNED; do
    step "PUT /warranty/update  (status=$STATUS)"
    http PUT /warranty/update "$(jq -nc --argjson cid "$CLAIM_ID" --arg s "$STATUS" \
      '{claimId:$cid, status:$s, technicalNote:"step \($s)"}')"
    soft_check "update warranty → $STATUS"
  done
fi

if [[ "${SOFT_FAILS:-0}" -gt 0 ]]; then
  printf "${C_YEL}  ${SOFT_FAILS} sub-step(s) failed${C_RST}\n"
fi
