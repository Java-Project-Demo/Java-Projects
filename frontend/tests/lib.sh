#!/usr/bin/env bash
# Shared helpers for UTC backend smoke tests.
# Source this file from each test script.

set -u

BASE_URL="${BASE_URL:-http://localhost:8888/api/v1}"
STATE_FILE="${STATE_FILE:-$(dirname "${BASH_SOURCE[0]}")/.state}"

C_RED=$'\033[31m'
C_GRN=$'\033[32m'
C_YEL=$'\033[33m'
C_CYN=$'\033[36m'
C_DIM=$'\033[2m'
C_RST=$'\033[0m'

step()   { printf "\n${C_CYN}▶ %s${C_RST}\n" "$*"; }
info()   { printf "${C_DIM}  %s${C_RST}\n" "$*"; }
ok()     { printf "${C_GRN}  ✓ %s${C_RST}\n" "$*"; }
fail()   { printf "${C_RED}  ✗ %s${C_RST}\n" "$*" >&2; exit 1; }

state_save() {
  local key="$1" val="$2"
  touch "$STATE_FILE"
  if grep -q "^${key}=" "$STATE_FILE" 2>/dev/null; then
    # macOS sed needs ''
    sed -i '' "s|^${key}=.*|${key}=${val}|" "$STATE_FILE"
  else
    printf "%s=%s\n" "$key" "$val" >> "$STATE_FILE"
  fi
}

state_load() {
  if [[ -f "$STATE_FILE" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "$STATE_FILE"
    set +a
  fi
}

state_reset() { rm -f "$STATE_FILE"; }

# http METHOD PATH [JSON_BODY] [EXTRA_CURL_ARGS...]
# Writes status to $HTTP_STATUS and body to $HTTP_BODY. Auto-adds Bearer token if $TOKEN set.
http() {
  local method="$1" path="$2" body="${3:-}"
  shift 3 2>/dev/null || shift $#
  local args=(-sS -X "$method" "${BASE_URL}${path}" -H 'Content-Type: application/json')
  if [[ -n "${TOKEN:-}" ]]; then
    args+=(-H "Authorization: Bearer ${TOKEN}")
  fi
  if [[ -n "$body" ]]; then
    args+=(-d "$body")
  fi
  args+=("$@")
  local resp
  resp=$(curl -w '\n__STATUS__:%{http_code}' "${args[@]}")
  HTTP_BODY="${resp%$'\n'__STATUS__:*}"
  HTTP_STATUS="${resp##*__STATUS__:}"
}

assert_status() {
  local want="$1"
  if [[ "${HTTP_STATUS:-}" != "$want" ]]; then
    printf "${C_RED}  ✗ Expected HTTP %s, got %s${C_RST}\n" "$want" "${HTTP_STATUS:-?}" >&2
    printf "${C_DIM}    Body: %s${C_RST}\n" "${HTTP_BODY:-}" >&2
    exit 1
  fi
}

# assert_ok — accept any 2xx (200, 201, 204…)
assert_ok() {
  if [[ "${HTTP_STATUS:-}" != 2* ]]; then
    printf "${C_RED}  ✗ Expected 2xx, got %s${C_RST}\n" "${HTTP_STATUS:-?}" >&2
    printf "${C_DIM}    Body: %s${C_RST}\n" "${HTTP_BODY:-}" >&2
    exit 1
  fi
}

# soft_check LABEL  — log result without aborting; returns 0 if 2xx, 1 otherwise
soft_check() {
  local label="$1"
  if [[ "${HTTP_STATUS:-}" == 2* ]]; then
    ok "$label  → $HTTP_STATUS"
    return 0
  else
    printf "${C_YEL}  ⚠ %s  → %s${C_RST}\n" "$label" "${HTTP_STATUS:-?}"
    printf "${C_DIM}    %s${C_RST}\n" "${HTTP_BODY:0:300}"
    SOFT_FAILS=$((${SOFT_FAILS:-0} + 1))
    SOFT_FAIL_LIST="${SOFT_FAIL_LIST:-}\n  - $label (HTTP $HTTP_STATUS)"
    return 1
  fi
}

# jget JQ_EXPR — extract from $HTTP_BODY
jget() {
  printf '%s' "$HTTP_BODY" | jq -r "$1"
}

# Unique suffix for idempotent reruns
uniq_suffix() { date +%Y%m%d%H%M%S; }

state_load
