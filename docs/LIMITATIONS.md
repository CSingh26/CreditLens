# Limits and interpretation

- Annual PD/LGD/EAD are supplied assumptions, not independently verified estimates. Sensitivity analysis explores these assumptions; it cannot predict which scenario occurs.
- One-year interest-only economics omit amortization, recovery timing, capital, taxes, liquidity, discounting, prepayment and uncertainty around correlations. EL is an expected value, not maximum loss or economic capital.
- DTI and utilization are contextual ratios. The source dataset lacks income and loss recovery, so CreditLens does not fabricate these from demographic or bill-history fields.
- Cohort labels must match the forecast horizon and come from observations not used to fit or select their model. The API cannot prove provenance assertions supplied by a user. Approval selection changes which outcomes are observed in real lending.
- Tiny bins and cohorts cannot establish calibration. No confidence interval or fairness compliance guarantee is supplied. Retrospective threshold comparisons are not independent prospective policy tests.
- The retained UCI model is historical one-month credit-card research, uses sensitive demographic fields and lacks modern out-of-time validation. It must not determine actual credit access or pricing.
- No authentication, public service hardening, regulatory decision process, production database or audit trail is included. Run locally for research; protect applicant data if extending the system.
- Dependencies are version locked for reproducibility; locking does not itself establish vulnerability-free dependencies. Existing optional training/explanation dependencies are retained.
