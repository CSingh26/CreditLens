from fastapi.testclient import TestClient
from app.main import app, settings


def test_invalid_content_length_is_client_error():
    response = TestClient(app).post('/analysis/lending', content='{}', headers={'content-length':'broken'})
    assert response.status_code == 400


def test_streamed_body_is_limited_without_content_length(monkeypatch):
    monkeypatch.setattr(settings,'max_request_size',100)
    response = TestClient(app).post('/analysis/lending', content=iter([b'x'*101]))
    assert response.status_code == 413
