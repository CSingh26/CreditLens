import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.main import app


def test_app_boots() -> None:
    assert app.title == "CreditLens API"
