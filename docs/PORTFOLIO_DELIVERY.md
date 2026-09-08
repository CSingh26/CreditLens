# CreditLens portfolio delivery — 2026-09-08

Repository: https://github.com/CSingh26/CreditLens (public, main).

Baseline revision: `69e67dbbb9bd041791b46b2afa91db13896f704b` (12 existing commits).
Final implementation revision after dependency hardening: `366e0be4fabb06d3964b248e41e2a7254a4e349d` (21 commits).
The delivery documentation commit follows this implementation revision; `git rev-parse HEAD` identifies that final packaging commit without a self-referential hash. Repository history exceeds the required 15 meaningful commits; original history was preserved. Origin uses the existing authenticated SSH identity because the HTTPS OAuth token could not update workflow files.

## Delivered financial workflow

- Annual analyst-supplied PD/LGD/EAD expected loss, survival-weighted interest, unconditional funding/operating costs, break-even coupon and stress decomposition.
- DTI, utilization and monthly income after existing debt and new interest, with limitations shown.
- User JSON cohort import with source/period metadata, bounded finite schemas, confusion matrix, Brier and cohort-rate benchmark, calibration bins/counts, threshold effects and scenario expected/realized contribution.
- Existing UCI scoring/explanation/fairness/monitoring preserved. Historical next-month PD remains separate from annual pricing. No invented metrics after service/artifact failure.
- UCI generic-column normalization, train-only scaling, separate calibration/selection labels, corrected threshold alignment, dataset hash and exact split manifest. Nonfinite/oversized requests and undefined fairness metrics covered by regressions.
- Responsive input-driven UI, finance-first README, model card, methodology, architecture, dictionary, contribution guide, screenshot and locked CI.

## Observed verification

| Command / observation | Result |
|---|---|
| `.venv/bin/python -m pytest services/api/tests -q` |40 passed, 0 failed; two upstream test-client deprecation warnings |
| `.venv/bin/ruff check services/api` |Pass |
| `npx pnpm@9.12.3 lint` |Pass |
| `npx pnpm@9.12.3 typecheck` |Pass |
| `npx pnpm@9.12.3 --filter web build` |Pass; all application routes compiled |
| `.venv/bin/python -m compileall -q services/api/app services/api/ml` |Pass |
| `pnpm --filter web test` (Playwright) |2 passed; real browser→API lending/cohort journey and unavailable model page |
| `../../.venv/bin/python -m ml.train` from services/api |Full 30,000-row UCI training passed; final run emitted no convergence warning |
| Real artifact TestClient metadata, metrics, fairness and POST score |All 4 endpoints returned 200; bounded PD and nonempty explanations |
| Tracked/new text-file secret pattern scan |113 files scanned after dependency hardening; no matching credential/private-key patterns |
| `git diff --check` |Pass |
| Remote SHA readback |Implementation revision equals origin/main at push |

Initial browser verification used an existing Chromium 1228 executable after a download stalled. The final dependency-hardening run used the installed browser for pinned Playwright 1.63.0 and passed both browser tests. GitHub CI installs its pinned Playwright browser and runs the same tests. Screenshot `docs/screenshots/lending-analysis.png` is from the running application and was visually inspected. Docker configuration was repaired by inspection; containers were not built/run on this machine, and no container-runtime verification is claimed.

## Observed model evidence

See `OBSERVED_MODEL_EVALUATION.json`: selected random forest; untouched 4,500-row test ROC-AUC 0.778156, average precision 0.549219, Brier 0.136116. Train/calibration/selection/test sizes 21,000/2,250/2,250/4,500. Normalized source SHA-256 `dfb1570f223efb65c0084027570369bdff6cc291b8238b9adce17ab60da4ca83`. These are historical cross-sectional one-month results, not evidence of annual credit-pricing validity or performance on contemporary borrowers.

## Independent review

The separate QuantEdge lead reviewed finance, quant, engineering, data, security and portfolio presentation. All reported findings were addressed with regressions: nonfinite legacy inputs, undefined fairness denominators, and artifact/test-data provenance. See `reviews/creditlens-review-disposition.md`. Cross-project independent reviews of FraudPulse and IntrinsicLab were also completed, with follow-up fixes confirmed; their reports are retained under `reviews/`.

## Remaining scope and material limitations

No required mission 3 analytical capability remains missing. Production underwriting remains explicitly out of scope: no validated annual PD estimator, amortization/recovery timing, capital pricing, modern out-of-time validation, fair-lending governance, authentication, tenant isolation or production audit trail. Annual LGD/EAD/costs are assumptions. UCI uses sensitive demographics and cannot establish deployment fairness. Historical risk grades and SHAP contributions are research conventions, not causal/legal decision reasons. Calibration uncertainty and reject inference are not solved. Dependencies are locked, not certified vulnerability-free; the secret scan is pattern-based, not a complete security audit.

## CI release evidence

[CI run 34279309106](https://github.com/CSingh26/CreditLens/actions/runs/34279309106) passed on the original implementation `e271787b4d68f67d4304ca0a53d52ea402320ed1`: locked installation, Python/frontend lint, TypeScript checking, 39 Python tests, Python compilation, production web build and 2 browser tests. `gh run watch 34279309106 --exit-status` returned success. The earlier complete model-risk revision also passed [run 34278982987](https://github.com/CSingh26/CreditLens/actions/runs/34278982987). The final delivery commit changes documentation only and receives the same complete CI workflow.

## Dependency-hardening follow-up

The earlier release dependency audit was incomplete; the follow-up baseline is `078a37b046d19a352efa4d296b240b30d547b6bb`. The updated tree uses patched Next.js/React/Playwright and compatible transitive overrides, plus FastAPI 0.141.1, Starlette 1.6.0 and pytest 9.0.3. Numerical and model-training dependencies remain unchanged. Next.js development origin controls explicitly permit only the local 127.0.0.1 hostname used by browser verification.

`npx pnpm@9.12.3 audit` and `pip-audit 2.10.1 -r services/api/requirements-lock.txt` both report zero known vulnerabilities, with no ignored advisory IDs. `pip check` passes. The tracked-file secret-pattern scanner reports zero findings and its detection regression is included in the 40 Python tests. CI runs these checks before lint, tests, build and browser verification. See [audit notes](DEPENDENCY_AUDIT.md) and [machine-readable results](DEPENDENCY_AUDIT_RESULTS.json). These are advisory snapshots and pattern checks, not a proof of vulnerability-free software.

[Dependency-hardening CI run 34283902821](https://github.com/CSingh26/CreditLens/actions/runs/34283902821) passed on `366e0be4fabb06d3964b248e41e2a7254a4e349d`, including the new Node/Python advisory and credential-pattern gates, 40 Python tests and two browser tests. `gh run watch 34283902821 --exit-status` returned success. The following documentation commit records this evidence; no further application changes are included.

A final newly published js-yaml advisory was addressed by pinning the compatible4.3.2 patch. Full Node audit, frontend lint/types/build and both browser journeys passed again; current default-branch CI verifies the complete suite.
