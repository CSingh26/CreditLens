# CreditLens implementation plan

Goal: make credit probability, loss severity and lending economics inspectable with valid user inputs.
Architecture: existing Next.js app → FastAPI → pure lending domain, alongside retained UCI model pipeline.
Tech: TypeScript/React, Python 3.12, Pydantic, sklearn.
Spec: ../specs/2026-09-08-lending-analysis.md. Execute inline as assigned; no child delegation.

1. Add tests for `analyze_lending(LendingInput)` (EL=400, contribution=180, break-even=0.1), finite/domain validation, stress and PD=1 edge. Run tests red; implement schemas/domain; run green; commit/push.
2. Add `analyze_cohort(CohortInput)` tests with four labeled observations yielding tn=tp=fp=fn=1, Brier=.325, threshold monotonicity and no undefined rate coercion. Run red; implement calibration, threshold economics and API integration; commit/push.
3. Test threshold optimizer against independently enumerated predictions; fix alignment and distinct calibration/selection subsets. Remove fabricated API fallbacks and return visible unavailable states; retain original pages.
4. Add browser journey before workbench implementation: calculate base EL, change stress and verify loss increase, import cohort and vary threshold; build UI backed by endpoints and accessible inputs. Run API tests plus lint/type/build/browser checks; commit/push.
5. Document methodology, architecture, dictionary, model card and limits. Pin dependencies, add complete CI including browser journey. Run full checks, secret scan and inspect latest GitHub Actions SHA; commit/push delivery evidence. Orchestrator commissions independent review.
