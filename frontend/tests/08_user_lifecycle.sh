#!/usr/bin/env bash
# Flow 8: User mgmt — list, create, get, update info, change role, change status.
set -eu
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "$SCRIPT_DIR/lib.sh"

[[ -n "${TOKEN:-}" ]] || fail "TOKEN missing"

step "GET /user/?page=0&size=10"
http GET "/user/?page=0&size=10"
soft_check "list users"
TOTAL=$(jget '.data.pagination.totalElements // 0')
info "totalElements=$TOTAL"

SUFFIX=$(uniq_suffix)
step "POST /user/  (create STOCK user)"
http POST "/user/" "$(jq -nc --arg n "TestUser $SUFFIX" '{fullName:$n, roleName:"STOCK", status:"ACTIVE"}')"
if soft_check "create user"; then
  NEW_USER_ID=$(jget '.data.id // empty')
  NEW_USERNAME=$(jget '.data.username // empty')
  state_save NEW_USER_ID "$NEW_USER_ID"
  info "created userId=$NEW_USER_ID, username=$NEW_USERNAME"
fi

if [[ -n "${NEW_USER_ID:-}" ]]; then
  step "GET /user/$NEW_USER_ID"
  http GET "/user/$NEW_USER_ID"
  soft_check "get user by id"

  step "PUT /user/$NEW_USER_ID/info  (update fullName + phone)"
  http PUT "/user/$NEW_USER_ID/info" "$(jq -nc '{fullName:"Updated Name", gender:1, phoneNumber:"0911222333"}')"
  soft_check "update user info"

  step "PUT /user/$NEW_USER_ID/role  (STOCK → SALES)"
  http PUT "/user/$NEW_USER_ID/role" '"SALES"'
  soft_check "change user role"

  step "PUT /user/$NEW_USER_ID/status  (deactivate)"
  http PUT "/user/$NEW_USER_ID/status" 'false'
  soft_check "deactivate user"

  step "PUT /auth/$NEW_USER_ID/reset-password"
  http PUT "/auth/$NEW_USER_ID/reset-password"
  soft_check "reset password"
fi

if [[ "${SOFT_FAILS:-0}" -gt 0 ]]; then
  printf "${C_YEL}  ${SOFT_FAILS} sub-step(s) failed${C_RST}\n"
fi
