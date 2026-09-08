# Contributing to CreditLens

Use Python 3.12 and pnpm 9.12.3. Install the locked dependencies and run the verification commands in README before proposing changes. Financial behavior changes need a hand-calculated example, invalid-input coverage and an API or browser regression as appropriate.

Keep annual lending assumptions separate from next-month UCI model outputs. Preserve finite units, probability horizons, explicit DEMO DATA labeling and unavailable states. Do not commit borrower records, model artifacts, cached datasets, credentials or local environment files. Never claim a predictive, economic or fairness result without recording the executed experiment and its limits.

The optional artifact root can be selected with CREDITLENS_ARTIFACTS_DIR. Model serialization is trusted-local only. Describe source/provenance and model-risk effects in pull requests; explain whether a change affects formulas, inputs, fitting/selection data or only presentation.
