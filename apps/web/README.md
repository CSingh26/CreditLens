# CreditLens Web

The CreditLens dashboard is a Next.js app that surfaces scoring, explanations, fairness diagnostics, and monitoring views.

## Architecture
```mermaid
flowchart TD
  Dashboard[/Dashboard/] --> Metrics[/model/metrics]
  Applicants[/Applicants/] --> List[/applicants]
  ApplicantDetail[/Applicant Detail/] --> Score[/applicants/{id}/score]
  Fairness[/Fairness/] --> FairnessAPI[/fairness/report]
  Monitoring[/Monitoring/] --> Drift[/monitoring/summary]
  ModelCard[/Model Card/] --> Docs[docs/model-card.md]
```

## Development
```bash
pnpm install
pnpm dev
```

By default the app expects the API at `http://127.0.0.1:8000`. Override it with:
```bash
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000 pnpm dev
```

## UI Pages
- `/dashboard`
- `/applicants`
- `/applicants/[id]`
- `/fairness`
- `/monitoring`
- `/model-card`

## Disclaimer
Demo project. Not for real lending decisions.
