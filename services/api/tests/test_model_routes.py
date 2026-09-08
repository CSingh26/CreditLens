from fastapi.testclient import TestClient
import app.main as main


def test_model_reports_preserve_nested_provenance_and_calibration(monkeypatch):
    monkeypatch.setattr(main,'ensure_artifacts',lambda:None)
    monkeypatch.setattr(main,'load_metadata',lambda:{'splits':{'train':10},'features':['x']})
    monkeypatch.setattr(main,'load_metrics',lambda:{'calibration_curve':[{'bin':0,'mean_predicted_prob':.1}]})
    client = TestClient(main.app)
    assert client.get('/model/metadata').json()['splits'] == {'train':10}
    assert client.get('/model/metrics').json()['calibration_curve'][0]['bin'] == 0
