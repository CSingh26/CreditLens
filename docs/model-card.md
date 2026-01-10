# CreditLens Model Card

## Model Overview
CreditLens predicts the probability of default for credit card applicants using a calibrated logistic regression and random forest model. The selected model is chosen by validation ROC-AUC and calibrated with sigmoid scaling.

## Intended Use
- Portfolio triage, internal analyst review, and demo scoring.
- Not intended for automated adverse action or production lending decisions.

## Training Data
- Dataset: UCI "Default of Credit Card Clients" (id=350) via `ucimlrepo`.
- Features: credit limit, demographic attributes, payment status, bill amounts, and payment amounts.
- Target: default payment next month (binary).

## Preprocessing
- Categorical features (`SEX`, `EDUCATION`, `MARRIAGE`) are one-hot encoded.
- Numeric features are imputed with the median when missing.

## Model Pipeline
- Candidates: logistic regression and random forest.
- Calibration: `CalibratedClassifierCV` with sigmoid method.
- Threshold: selected by F1 optimization on the validation set.

## Performance Metrics (Test Split)
- ROC-AUC, PR-AUC, Brier score, and confusion matrix are reported in `/model/metrics`.
- Calibration curve summary is stored in model artifacts.

## Fairness Diagnostics
- Slice metrics are reported for `SEX`, `EDUCATION`, and `AGE` bands.
- Metrics include selection rate, TPR, FPR, and AUC per group.
- These diagnostics are descriptive only and do **not** constitute compliance approval.

## Limitations
- Dataset is historical and limited to a single issuer.
- Demographic attributes can reflect societal bias.
- Model performance may degrade under drift or policy changes.

## Monitoring
- Baseline feature statistics are stored at training time.
- `/monitoring/summary` compares current applicants to baseline using PSI-like drift measures.

## Ethical Considerations
- Human review is required before any lending decision.
- Avoid using outputs for legally binding determinations without governance review.
