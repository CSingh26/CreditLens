.PHONY: dev train test

dev:
	@echo "Backend: cd services/api && python -m uvicorn app.main:app --reload"
	@echo "Frontend: cd apps/web && pnpm dev"

train:
	cd services/api && ../../.venv/bin/python -m ml.train

test:
	cd services/api && pytest
	cd apps/web && pnpm lint && pnpm typecheck
