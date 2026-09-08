# CreditLens model card

## Two distinct analytical modes

The lending workbench is a deterministic scenario calculator with externally supplied **annual** PD. Its demo has four invented observations for arithmetic verification. It does not fit a PD model or claim predictive performance. Calibration results describe whichever labeled cohort the user supplies.

The optional historical model predicts **default payment next month** using [UCI Default of Credit Card Clients](https://archive.ics.uci.edu/dataset/350/defaultofcreditcardclients), 30,000 Taiwan credit-card records with monthly payment history April–September 2005. Data is fetched through ucimlrepo and cached locally. Money is New Taiwan dollars. This population and outcome do not establish modern lending validity or annual default probabilities.

## Training and evaluation

Logistic regression and random forest use preprocessing fitted on a 70% stratified training split. The remaining 30% is split into 15% untouched test and 15% divided equally into calibration and selection subsets (7.5% each). Sigmoid calibration is fit on calibration labels; model ROC-AUC selection and F1 threshold choice use only selection labels. Test data is evaluated after these choices. Seeds 42/43 reproduce the split.

The dataset represents a cross-sectional historical snapshot; random stratification is explicitly a within-snapshot evaluation. There is no sufficient origination/event-time series to claim chronological out-of-time validation. Applying the model to modern borrowers without new temporal/population validation would be unsupported.

Reported artifacts include ROC-AUC, average precision (named PR-AUC in legacy schema), Brier score, default prevalence, confusion counts and calibration summary. No unexecuted result is stated here. Train locally for observed artifacts. The logistic model is a baseline; model complexity alone is not evidence of economic usefulness.

## Explanations and model risk

Existing SHAP explanations describe contributions to a fitted model output, not causation, repayment capacity, legal adverse-action reasons or guaranteed individual outcomes. Risk buckets (<.2, <.5, otherwise high) are display conventions, not validated underwriting grades. F1 threshold maximization is a research classification baseline and ignores lending costs; the separate workbench exposes the missing economics.

Legacy predictors include sex, age, education and marital status. Their presence can raise serious fairness and deployment concerns; group diagnostics are descriptive and cannot establish compliance or absence of discrimination. This application must not be deployed as an autonomous lending decision system. Demographic variables are not used by the new annual scenario calculator.

## Limitations

No monitoring of realized repayment outcomes, external validation, confidence intervals, reject-inference solution, causal model, regulated model governance, model registry, retraining trigger, security-hardened hosting or audit trail. See [limitations](LIMITATIONS.md).
