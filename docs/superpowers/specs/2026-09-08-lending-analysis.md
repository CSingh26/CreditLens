# CreditLens lending analysis design

Baseline: 69e67dbbb9bd041791b46b2afa91db13896f704b; 12 existing commits. Existing Next.js/FastAPI/UCI research application is preserved. User has authorized autonomous design and implementation.

## Responsibilities and decisions
- Finance: one-year, interest-only scenario with analyst-supplied annual PD, LGD and EAD; EL = PD × LGD × EAD. Survival-weighted interest less funding, operating cost and EL produces expected contribution and a break-even coupon. No conversion of the UCI next-month probability into annual PD.
- Quant: validate bounded finite inputs; confusion counts classify default at PD >= threshold; calibration bins retain counts and compare forecast vs observed rate; Brier and constant-rate baseline expose calibration quality. Threshold sweep shows realized approved-book contribution under supplied loan terms, not accuracy maximization.
- Data: JSON cohort import with row IDs, annual probabilities, observed annual outcomes and source/period metadata. Explicit DEMO DATA fixture; no remote failures replaced with numbers. UCI is historical Taiwan credit-card research, with demographic inputs documented as inappropriate for deployment without separate review.
- ML: preserve fitted scoring pipeline; fix threshold alignment and separate calibration from model/threshold selection. New lending workbench accepts externally estimated PD and does not invent a fitted model.
- Software: isolated typed Pydantic contracts and pure domain functions, FastAPI /analysis/lending and /analysis/cohort; existing app retained. Bounded request sizes and rows.
- UI: dashboard becomes useful input-driven lending workflow, transparent result decomposition, stress controls and cohort JSON import; existing trained model pages show unavailable states honestly.
- Release: meaningful milestones, exact dependencies/lockfile, formula and invalid-data tests first, API integration, browser journey, lint/typecheck/build and latest-SHA CI. Independent review scheduled by orchestrator.

Alternatives considered: replacing all scoring with a new trained PD model would discard existing work; auto-annualizing the one-month UCI PD would introduce unjustified stationarity. A separate horizon-explicit analytical workbench is the smallest defensible extension.

Acceptance: hand case PD=.1, LGD=.4, EAD=10000 yields EL=400; coupon=.12 and funding=.04 plus cost=100 yields contribution=180; zero-survival break-even is undefined. Scenario and cohort outcomes change with inputs; missing model artifacts never manufacture metrics.
