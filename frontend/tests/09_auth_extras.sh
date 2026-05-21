#!/usr/bin/env bash
# Flow 9: Auth extras — refresh-token, change-password (revert at end).
set -eu
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "$SCRIPT_DIR/lib.sh"

[[ -n "${TOKEN:-}" ]] || fail "TOKEN missing"

step "POST /auth/refresh-token  (no body, no cookie sent — expect 401/400)"
http POST /auth/refresh-token
soft_check "refresh-token (no cookie)"

step "PUT /auth/change-password  (admin → admin1)"
http PUT /auth/change-password "$(jq -nc '{oldPassword:"admin", newPassword:"admin1", confirmPassword:"admin1"}')"
if soft_check "change password admin → admin1"; then
  step "Login with new password to verify"
  http POST /auth/login "$(jq -nc '{username:"admin", password:"admin1"}')"
  if soft_check "login with new password"; then
    NEW_TOKEN=$(jget '.data.accessToken // empty')
    [[ -n "$NEW_TOKEN" ]] && TOKEN="$NEW_TOKEN" && state_save TOKEN "$NEW_TOKEN"
  fi

  step "Revert password back to admin"
  http PUT /auth/change-password "$(jq -nc '{oldPassword:"admin1", newPassword:"admin", confirmPassword:"admin"}')"
  soft_check "revert password admin1 → admin"

  step "Re-login with original password"
  http POST /auth/login "$(jq -nc '{username:"admin", password:"admin"}')"
  if soft_check "login with reverted password"; then
    NEW_TOKEN=$(jget '.data.accessToken // empty')
    [[ -n "$NEW_TOKEN" ]] && state_save TOKEN "$NEW_TOKEN"
  fi
fi

if [[ "${SOFT_FAILS:-0}" -gt 0 ]]; then
  printf "${C_YEL}  ${SOFT_FAILS} sub-step(s) failed${C_RST}\n"
fi
