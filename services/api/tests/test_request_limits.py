from fastapi.testclient import TestClient
from app.main import app, settings


def test_invalid_content_length_is_client_error():
    response = TestClient(app).post('/analysis/lending', content='{}', headers={'content-length':'broken'})
    assert response.status_code == 400


def test_streamed_body_is_limited_without_content_length(monkeypatch):
    monkeypatch.setattr(settings,'max_request_size',100)
    response = TestClient(app).post('/analysis/lending', content=iter([b'x'*101]))
    assert response.status_code == 413


def test_nonfinite_json_validation_returns_422_not_serialization_error():
    response = TestClient(app).post('/analysis/lending', content='{"pd":1e999,"lgd":0.4,"ead":10000,"annual_rate":0.12,"funding_rate":0.04,"operating_cost":100}', headers={'content-type':'application/json'})
    assert response.status_code == 422
