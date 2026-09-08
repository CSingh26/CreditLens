# Independent IntrinsicLab review — 2026-09-08

Reviewer: CreditLens project lead. Read-only inspection of IntrinsicLab revision 5755df9c9d819b9acc7cc1a66137c5d8ac685cf9/current worktree, including contracts, WACC, FCFF/DCF, sensitivity, ingestion, comparables, service/API/body limits and browser JS. No IntrinsicLab files edited.

## Actionable findings

1. **P2 — applying statements can silently relabel retained monetary assumptions into a different currency.** `src/intrinsiclab/static/app.js` CSV `apply-statements` handler copies the imported row's currency/revenue/NWC into the current model while retaining previous debt, cash, preferred claims, share assumptions and future drivers. Reproduction by code path: start the USD demo, import valid EUR annual CSV, click Apply latest annual base. Existing USD debt/cash numerical balances now become EUR without FX conversion or a review gate. Require matching currency for partial imports, or explicitly clear/request all remaining monetary assumptions before calculating. Source should explain that only historical revenue/NWC were imported while future assumptions remain the prior case.
2. **P2 — WACC calculator retains stale apply action after capital inputs change.** The capital-form submit handler creates an Apply WACC closure over response `r`, but input edits do not clear that result/button or invalidate an in-flight response. Reproduction: calculate WACC; edit beta/debt cost; click Apply WACC without resubmitting. It applies the previous `r.wacc` while the panel shows revised inputs. Clear/mark stale results on capital-input change and ignore obsolete requests, following the valuation form's existing requestId pattern.

## Financial/quant checks

Executed actual pure functions with bytecode writes disabled: E=60, D=40, Rf=.04, beta=1, ERP=.06, Rd=.05, T=.25 gives WACC=.075. Demo DCF matches the stated roughly USD43.26/share, increasing WACC by1pp lowers value, growth>=WACC produces an unavailable sensitivity cell, and enterprise-to-equity identity residual is zero. FCFF uses no instant tax benefit for negative EBIT, includes opening-NWC movements, and discounts annual unlevered flows at WACC. Gordon reinvestment g/ROIC and the distinction between market financing weights and net claims are credible and explicitly described. Negative-growth disinvestment is flagged as a strong assumption. No mandatory formula blocker found.

## Engineering, data, security and presentation

Finite bounded contracts, source records, annual consecutive-period/currency checks, pure finance boundaries and typed outputs are appropriate. Public inputs never become trusted code; browser interpolation escapes user text. Body middleware bounds streamed content before schema parsing and validation errors omit raw nonfinite input. Evidence import recomputes the assumption document. Model hash is a reproducibility identifier rather than a source-certification claim. There is no live provider or audit assertion.

README quickly establishes the financial question and observes the difference between high growth and value creation. It contains concrete reproducible demo output, terminal-value dependence, test commands and source/units limitations. Existing browser tests and docs complement the model rather than obscure it. This static/targeted review is not a complete internet-facing security audit or rerun of all34 Python/3 browser tests.

## Follow-up verification

At revision59906f6b89cd092d5fae7c857df4349ca74908ea, read-only inspection confirms statement application disables mismatched currencies and rechecks currency at click time; capital-input edits remove the old result and increment a request epoch that is checked before applying a response. Two specific browser regressions cover currency preservation and obsolete WACC removal. Both findings resolved in the reviewed code; no additional blocker from this bounded review.
