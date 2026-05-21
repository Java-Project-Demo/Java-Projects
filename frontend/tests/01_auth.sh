#!/usr/bin/env bash
# Flow 1: Auth — login as admin and capture access token.
set -eu
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "$SCRIPT_DIR/lib.sh"

USERNAME="${ADMIN_USERNAME:-admin}"
PASSWORD="${ADMIN_PASSWORD:-admin}"

step "POST /auth/login as $USERNAME"
http POST /auth/login "$(jq -nc --arg u "$USERNAME" --arg p "$PASSWORD" '{username:$u, password:$p}')"
assert_status 200

TOKEN_VAL=$(jget '.data.accessToken // empty')
USER_ID=$(jget '.data.userId // empty')
USERNAME_RESP=$(jget '.data.username // empty')

[[ -n "$TOKEN_VAL" ]] || fail "accessToken missing in login response"
[[ -n "$USER_ID" ]]   || fail "userId missing in login response"

state_save TOKEN     "$TOKEN_VAL"
state_save USER_ID   "$USER_ID"
state_save USERNAME  "$USERNAME_RESP"

ok "Logged in as $USERNAME_RESP (userId=$USER_ID)"
info "Token saved to $STATE_FILE"
