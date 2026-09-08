# Independent FraudPulse review — 2026-09-08

Reviewer: CreditLens project lead, read-only inspection of FraudPulse revision 00be65e02b7cabba70395e57cd6d2b4bd7889d43 plus current working research UI. No FraudPulse files changed.

## Actionable findings

1. **P2 — undefined precision and recall are displayed as measured zero.** `services/ml/app/evaluation.py:16-17` returns 0.0 when no predicted positives or no actual positives exist. Reproduction using the actual function: `evaluate([0,0],[.1,.2],[10,20],.5,2,5,1)` returns precision=recall=0.0 despite neither denominator being positive. The UI compares these to other policies as numerical performance. Return null and display an appropriate undefined-denominator explanation; add no-flag and no-fraud tests.
2. **P2 — cost controls can describe a different experiment than displayed results.** `apps/web/src/app/research/page.tsx` cost-input onChange updates costs without clearing/marking current results, and inputs/file upload remain editable while a request is pending. A user can run the demo, change review cost to 1000, and still see old scenario cost under the new control value. A request can also finish after the user replaces the uploaded file, restoring results for the prior file. Clear/mark stale results on cost changes, show returned cost assumptions alongside results, and disable edits while busy or ignore obsolete request IDs.
3. **P2 — perfect prevention of flagged fraud is implicit in the cost objective.** `services/ml/app/evaluation.py:20` charges loss only for missed fraud. Every true positive therefore avoids all loss and adds only review cost. The UI says review/investigation, which does not necessarily prevent or recover 100% of transaction value. Make the assumption explicit beside scenario cost and in model methodology, or introduce a recovery/prevention fraction for flagged fraud. Otherwise users may interpret detection economics as plausible realized savings even though the screen labels it scenario cost.

## Finance / quant / engineering assessment

The new workflow correctly isolates training, validation threshold selection and later test labels. Feature history excludes the current timestamp batch, rolls per account, and never consumes labels. Tests challenge future-label leakage and reconstruct per-transaction logistic scores from signed contributions. Currency normalization, unique IDs, finite bounded values and timezone-aware timestamps are validated. These are credible engineering and financial-reasoning improvements.

Threshold quantile grid is explicitly approximate (up to53 candidates), and deterministic cost ties prefer fewer reviews. It does not claim an exact global optimum. The research UI distinguishes uncalibrated scores, settled labels, PR-AUC vs average precision, and gives a meaningful individual investigation journey. Baselines make class-imbalance economics visible.

The existing README still starts with unsupported “production-ready” and does not introduce the new research workflow. Rewrite before delivery as the lead has planned. Static review does not establish internet-facing security. JSON size validation occurs after body materialization in the web proxy; public-host request limits and authentication remain deployment limitations.

## Validation performed

Read behavior/evaluation/research/routes and frontend/proxy, inspected research tests, executed the no-class/no-flag metric counterexample against the real evaluation module with bytecode writes disabled. No full build rerun or source modification in FraudPulse.
