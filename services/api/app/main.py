from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, PlainTextResponse
from sqlmodel import Session, select

from .config import settings
from .database import get_session, init_db
from .models import Applicant, Score
from .schemas import ApplicantCreate, ApplicantRead, ScoreRead, ScoreResponse
from .scoring import load_artifacts, load_metadata, load_metrics, score_payload
from .seed import seed_if_empty

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    with get_session() as session:
        seeded = seed_if_empty(session)
        if seeded:
            logger.info("Seeded %s applicants", seeded)
    yield


app = FastAPI(title="CreditLens API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list(),
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.middleware("http")
async def limit_body_size(request: Request, call_next):
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > settings.max_request_size:
        return JSONResponse(status_code=413, content={"detail": "Request body too large."})
    return await call_next(request)



def ensure_artifacts() -> None:
    try:
        load_artifacts()
    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model artifacts missing. Run: python services/api/ml/train.py",
        ) from exc


@app.get("/healthz")
def healthz() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/model/metadata")
def model_metadata() -> dict[str, str | int | list]:
    ensure_artifacts()
    try:
        return load_metadata()
    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model metadata missing. Run: python services/api/ml/train.py",
        ) from exc


@app.get("/model/metrics")
def model_metrics() -> dict[str, str | int | float | dict]:
    ensure_artifacts()
    try:
        return load_metrics()
    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model metrics missing. Run: python services/api/ml/train.py",
        ) from exc


@app.get("/model/card", response_class=PlainTextResponse)
def model_card() -> str:
    root = Path(__file__).resolve().parents[3]
    card_path = root / "docs" / "model-card.md"
    if not card_path.exists():
        return "Model card not found. Generate docs/model-card.md."
    return card_path.read_text()


@app.get("/applicants", response_model=list[ApplicantRead])
def list_applicants(
    limit: int = 50,
    offset: int = 0,
    session: Session = Depends(get_session),
) -> list[Applicant]:
    limit = max(1, min(limit, 500))
    offset = max(0, offset)
    return list(session.exec(select(Applicant).offset(offset).limit(limit)))


@app.get("/applicants/{applicant_id}", response_model=ApplicantRead)
def get_applicant(applicant_id: int, session: Session = Depends(get_session)) -> Applicant:
    applicant = session.get(Applicant, applicant_id)
    if not applicant:
        raise HTTPException(status_code=404, detail="Applicant not found")
    return applicant


@app.post("/applicants", response_model=ApplicantRead, status_code=status.HTTP_201_CREATED)
def create_applicant(
    payload: ApplicantCreate,
    session: Session = Depends(get_session),
) -> Applicant:
    applicant = Applicant(**payload.model_dump())
    session.add(applicant)
    session.commit()
    session.refresh(applicant)
    return applicant


@app.post("/score", response_model=ScoreResponse)
def score_applicant(payload: ApplicantCreate) -> ScoreResponse:
    ensure_artifacts()
    output = score_payload(payload)
    metrics = model_metrics()

    return ScoreResponse(
        pd=output["pd"],
        risk_bucket=output["risk_bucket"],
        threshold=output["threshold"],
        model_name=metrics.get("selected_model", "unknown"),
    )


@app.post("/applicants/{applicant_id}/score", response_model=ScoreRead)
def score_stored_applicant(
    applicant_id: int,
    session: Session = Depends(get_session),
) -> Score:
    ensure_artifacts()
    applicant = session.get(Applicant, applicant_id)
    if not applicant:
        raise HTTPException(status_code=404, detail="Applicant not found")

    payload = ApplicantCreate(**applicant.model_dump(exclude={"id", "created_at"}))
    output = score_payload(payload)
    metrics = model_metrics()

    score = Score(
        applicant_id=applicant_id,
        pd=output["pd"],
        risk_bucket=output["risk_bucket"],
        model_name=metrics.get("selected_model", "unknown"),
    )
    session.add(score)
    session.commit()
    session.refresh(score)
    return score
