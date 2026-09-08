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

## Reproducibility improvements

Provider X1…X23/Y columns are normalized into documented UCI names. Training records the normalized CSV SHA-256, exact split row indices, seeds, sklearn version and next-month horizon. Fairness evaluation reuses saved test indices and rejects a changed CSV hash; older artifacts without provenance require retraining. Numeric monetary features are standardized using training-only statistics to avoid the baseline optimizer's observed convergence problem.

## Observed run, 2026-09-08

The full normalized 30,000-row UCI run selected random forest on the selection subset. On the untouched 4,500-row test subset it produced ROC-AUC 0.778156, average precision 0.549219 and Brier 0.136116. These are observed within-snapshot results, not contemporary or annual lending validation. [Full metrics and provenance](OBSERVED_MODEL_EVALUATION.json) include the source hash and 21,000/2,250/2,250/4,500 train/calibration/selection/test counts. The final training run completed without the earlier logistic convergence warning after train-fitted monetary standardization.
