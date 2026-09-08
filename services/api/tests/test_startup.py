from unittest.mock import MagicMock
from fastapi.testclient import TestClient
import app.main as main


def test_default_startup_does_not_download_training_data(monkeypatch):
    monkeypatch.setattr(main, 'init_db', lambda: None)
    monkeypatch.setattr(main, 'get_session', MagicMock())
    def no_network(*args):
        raise AssertionError('Default startup must not seed/download data')
    monkeypatch.setattr(main, 'seed_if_empty', no_network)
    with TestClient(main.app) as client:
        assert client.get('/healthz').status_code == 200
