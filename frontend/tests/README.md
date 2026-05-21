# UTC Backend Smoke Tests

Bash + curl scripts that walk through the main user flows end-to-end against
the running backend at `http://localhost:8888/api/v1`.

## Prereqs

- `docker compose up -d` (backend + oracle running)
- `jq` (already installed on this machine)
- Default admin account: `admin / admin`

## Run

```bash
# All flows (stops at first failure)
bash tests/run_all.sh

# Fresh start (wipes saved IDs/token from .state)
bash tests/run_all.sh --reset

# Just one flow (uses IDs saved by earlier flows)
bash tests/01_auth.sh
bash tests/05_export.sh
```

## Files

| File | Flow | Endpoints exercised |
|---|---|---|
| `lib.sh`          | shared helpers (http, jq, state file, colored output) | — |
| `01_auth.sh`      | Login as admin       | `POST /auth/login` |
| `02_master_data.sh` | Category + Supplier + Product (hasImei=true) | `POST /category/`, `POST /supplier/`, `POST /product/` |
| `03_warehouse.sh` | Create warehouse + 6-bin layout + list bins | `POST /warehouse/create`, `POST /warehouse/setup-layout`, `GET /warehouse/available-bins` |
| `04_import.sh`    | Import 2 IMEIs       | `POST /stock/import` |
| `05_export.sh`    | Sell IMEI_A to customer | `POST /order/create` |
| `06_reports.sh`   | Dashboard + IMEI trace | `GET /dashboard/summary`, `GET /dashboard/trace?imei=…` |
| `run_all.sh`      | Chains all of the above | — |

## State

IDs/tokens between scripts are persisted to `tests/.state` (KEY=value).
Inspect with `cat tests/.state` after a run; reset with `--reset`.

## Customise

Override per-run with env vars:

```bash
BASE_URL=http://localhost:8888/api/v1 \
ADMIN_USERNAME=admin ADMIN_PASSWORD=admin \
bash tests/run_all.sh
```
