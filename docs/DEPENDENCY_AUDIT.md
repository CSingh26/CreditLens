# Dependency audit follow-up

Scope: repair vulnerable release dependencies without changing the financial model or weakening request validation. Follow-up baseline: `078a37b046d19a352efa4d296b240b30d547b6bb`.

The portfolio audit identified vulnerable Node dependencies including Next.js 16.1.1. The patched tree uses Next.js/eslint-config-next 16.3.3, React/React DOM 19.2.8, Playwright 1.63.0 and compatible pinned transitive overrides. The existing browser regression initially failed because Next.js now rejects development assets requested from 127.0.0.1 by default. `allowedDevOrigins` allows only that local hostname; no wildcard or production security bypass is introduced. The actual two-test browser journey passes with the new versions.

The baseline Python lock audit returned 10 vulnerability entries across Starlette 0.38.6 and pytest 8.3.3 (some advisory entries duplicate the same ID). Remediation updates FastAPI and Starlette together within their declared dependency ranges, plus pytest. Numerical/ML dependencies and fitted model parameters remain unchanged. Every dependency update must pass the same 39 Python tests, 2 browser tests, lint/typechecking/build, request-limit regressions and real stored-model API probes.

Audit tools report known advisories as of the run, not proof that dependencies are vulnerability-free. CI will run both audits and a tracked-file secret-pattern scan, with no ignored vulnerability IDs.

## Verified outcome

The final candidate pins FastAPI 0.141.1, Starlette 1.6.0 and pytest 9.0.3; `pip check` reports no broken requirements. `pip-audit 2.10.1 -r services/api/requirements-lock.txt` reports no known vulnerabilities. `npx pnpm@9.12.3 audit` reports zero findings at every severity. A machine-readable snapshot is saved in `DEPENDENCY_AUDIT_RESULTS.json`.

The full suite passes: 40 Python tests (the original 39 plus one scanner regression), two browser tests, Python/frontend lint, TypeScript checking and production build. Real stored-model metadata, metrics, fairness and scoring endpoints return HTTP 200; the score has a bounded PD and nonempty SHAP explanations. Financial/data/model code and fitted numerical artifacts did not change. Two upstream test-client deprecation warnings remain visible; no test or validation was disabled.

CI now runs the Node audit, a Python-lock audit from an isolated pinned audit-tool environment, and `scripts/check_secrets.py`, which reports file paths without printing matched secrets. The scanner is conservative pattern matching, not a complete secret-detection or security audit.
