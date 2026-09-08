# Data dictionary and import format

All money in a request uses the same chosen currency. No conversion or currency inference occurs.

| Field | Meaning / units |
|---|---|
| pd | Annual default probability, decimal [0,1] |
| lgd | Fraction of exposure lost conditional on default, decimal [0,1] |
| ead | Exposure at default, positive currency units |
| annual_rate / funding_rate | One-year coupon / funding rate, decimals [0,1] |
| operating_cost | Annual absolute currency cost per borrower |
| pd_multiplier | Stress PD multiplier [0,10], result capped at 1 |
| lgd_stress | Additive LGD stress, decimal [0,1] |
| rate_shock | Additive annual coupon and funding shock, decimal [0,1] |
| monthly_income / monthly_debt | Gross income and existing debt payments; supply together |
| credit_balance / credit_limit | Revolving credit balance and limit; supply together |
| source | Nonempty source/provider/provenance description; ≤300 chars |
| observation_period | Nonempty description of the evaluated period; ≤200 chars |
| horizon_months | Must equal 12 for cohort evaluation |
| threshold | Flag default if PD >= threshold, decimal [0,1] |
| rows[].id | Unique string observation identifier |
| rows[].defaulted | Observed default within one year: 0 or 1 |

Cohort JSON accepted by the UI (coupon/funding/cost are taken from the current loan controls):

```json
{
  "source": "Your exported evaluation cohort and model version",
  "observation_period": "2024-01-01 through 2024-12-31",
  "horizon_months": 12,
  "rows": [
    {"id": "anonymous-1", "pd": 0.1, "defaulted": 0, "ead": 10000, "lgd": 0.4}
  ]
}
```

Direct POST `/analysis/cohort` additionally requires threshold, annual_rate, funding_rate and operating_cost. At most 5,000 rows; HTTP body cap 1 MB and UI file limit 900 KB. IDs need not be borrower names; avoid importing personal identifiers. Extra schema fields and nonfinite numbers are rejected. Missing labels are not imputed. No external-provider failure is replaced with a fixture.

Legacy UCI applicant fields: LIMIT_BAL, BILL_AMT1…6 and PAY_AMT1…6 use New Taiwan dollars; PAY_0 and PAY_2…6 are monthly repayment-status categories; demographic code fields and AGE follow the original dataset dictionary. They do not provide annual income, LGD, annual PD or realized loss severity. Consult the [UCI source](https://archive.ics.uci.edu/dataset/350/defaultofcreditcardclients) before interpretation.
