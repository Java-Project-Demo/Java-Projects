#!/usr/bin/env bash
# Run all smoke tests in order. Stops at first failure.
set -eu
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "$SCRIPT_DIR/lib.sh"

if [[ "${1:-}" == "--reset" ]]; then
  state_reset
  printf "${C_YEL}State file reset${C_RST}\n"
fi

SCRIPTS=(
  01_auth.sh
  02_master_data.sh
  03_warehouse.sh
  04_import.sh
  05_export.sh
  06_reports.sh
)

START=$(date +%s)
for s in "${SCRIPTS[@]}"; do
  printf "\n${C_YEL}══════ %s ══════${C_RST}\n" "$s"
  bash "$SCRIPT_DIR/$s"
done

END=$(date +%s)
printf "\n${C_GRN}══════════════════════════════════════════${C_RST}\n"
printf "${C_GRN}  ALL FLOWS PASSED  (took $((END-START))s)${C_RST}\n"
printf "${C_GRN}══════════════════════════════════════════${C_RST}\n"
printf "${C_DIM}State at: %s${C_RST}\n" "$STATE_FILE"
