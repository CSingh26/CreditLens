# Financial methodology

## One-year loss and contribution

PD is an annual default probability, LGD the fraction of EAD lost conditional on default, and EAD the assumed constant exposure in one currency. EL = PD × LGD × EAD. These concepts follow [Basel risk-component definitions](https://www.bis.org/basel_framework/chapter/CRE/32.htm?inforce=20230101&published=20200327); this simplified engine is not a regulatory capital or accounting provision implementation.

For annual coupon r, annual funding cost f, and absolute annual operating cost C:

- Expected interest = (1 − PD) × r × EAD.
- Expected contribution = expected interest − f × EAD − C − EL.
- Return on exposure = contribution / EAD.
- Break-even coupon = (EL + f × EAD + C) / ((1 − PD) × EAD).

At PD=1 the denominator vanishes and the API returns null, displayed as Undefined. A break-even coupon above 100% is mathematically possible and indicates an uneconomic assumed exposure, not a recommended price. EAD must be positive; LGD and PD are in [0,1]. Rates are decimals in APIs and percentages in UI. Monetary and numeric values must be finite and are bounded to avoid overflow.

Interpretation assumes a one-year, constant-exposure interest-only loan, zero interest in default, all funding/operating cost incurred regardless of outcome, and LGD already net of recovery. No amortization, recovery timing, prepayments, capital charge, discounting, taxes, risk premium or origination fees are modeled. Funding and coupon both move by the chosen stress shock. PD multiplier and LGD increment are analyst assumptions capped at 100%.

Example: PD=.1, LGD=.4, EAD=10,000, r=.12, f=.04, C=100 gives loss 400, interest 1,080, contribution 180 and break-even .10. Doubling PD to .2 and raising LGD to .5 gives loss 1,000.

## Borrower financial capacity

DTI = existing monthly debt payments / monthly gross income. Utilization = revolving balance / credit limit; over-limit balances can legitimately produce >100%. Residual income = gross monthly income − existing monthly debt − EAD × annual coupon / 12. Existing debt excludes the new loan; living expenses and taxes are missing, so residual income is not disposable income. These contextual ratios neither estimate PD nor imply causal explanations of a supplied PD.

## Cohort evaluation

Rows require forecast annual PD, annual observed outcome (1=default), assumed LGD/EAD, unique ID, source and observation period. An observation is flagged when PD >= threshold and treated as approved otherwise. Confusion matrix positive class is default: TP flagged/defaulted; FP flagged/repaid; FN approved/defaulted; TN approved/repaid. Undefined precision, recall and approved default rate remain null, never zero.

Brier = mean((PD − outcome)^2); smaller is better, but it mixes calibration, discrimination and outcome uncertainty. Ten fixed [0,.1), …, [.9,1] bins retain counts, mean PD and observed default rate. Empty bins are returned with null rates. No confidence intervals are shown; a four-row demo cannot establish calibration.

The cohort-rate constant baseline has Brier = prevalence × (1 − prevalence). This uses observed evaluation prevalence, so it is a descriptive benchmark, not an out-of-sample fitted baseline.

Approved expected contribution uses the same finance equation per approved row. Scenario realized contribution replaces PD with the observed 0/1 outcome while retaining assumed LGD/EAD and costs. It is not audited profit. The threshold sweep is retrospective; selecting its best observed threshold and claiming performance on the same data would overfit. Use an independent policy-selection set and untouched later cohorts before claiming decision quality. Declined borrowers' outcomes may not be observable in real lending (selection bias).

## Historical model

See the [model card](MODEL_CARD.md) for the distinct one-month UCI research task. The threshold optimizer aligns each threshold with precision/recall at that threshold, excluding the final sentinel pair per [sklearn's documented convention](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.precision_recall_curve.html). Calibration data must be distinct from fitting data, as described in [sklearn 1.5 calibration](https://scikit-learn.org/1.5/modules/generated/sklearn.calibration.CalibratedClassifierCV.html).
