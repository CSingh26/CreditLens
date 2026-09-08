import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.cohort import CohortInput, analyze_cohort
from app.main import app


def cohort(**changes):
    data = dict(source='Hand-calculated fixture', observation_period='2024 calendar year', horizon_months=12,
                threshold=.5, annual_rate=.12, funding_rate=.04, operating_cost=100,
                rows=[dict(id=str(i), pd=p, defaulted=y, ead=10000, lgd=.4)
                      for i, (p,y) in enumerate([(.1,0),(.4,1),(.6,0),(.9,1)])])
    return CohortInput(**(data | changes))


def test_confusion_calibration_and_lending_economics():
    result = analyze_cohort(cohort())
    assert result['confusion'] == dict(tn=1, fp=1, fn=1, tp=1)
    assert result['brier_score'] == pytest.approx(.185)
    assert result['baseline_brier_score'] == pytest.approx(.25)
    assert sum(b['count'] for b in result['calibration']) == 4
    assert result['approved_count'] == 2
    assert result['realized_approved_contribution'] == pytest.approx(-3800)
    assert result['expected_approved_loss'] == pytest.approx(2000)


def test_boundary_and_threshold_sweep():
    result = analyze_cohort(cohort(threshold=.4))
    assert result['confusion'] == dict(tn=1, fp=1, fn=0, tp=2)
    counts = [r['approved_count'] for r in result['threshold_sweep']]
    assert counts == sorted(counts)
    assert analyze_cohort(cohort(threshold=0))['approved_default_rate'] is None


@pytest.mark.parametrize('changes', [dict(rows=[]), dict(horizon_months=1), dict(threshold=float('nan')),
    dict(source=''),dict(rows=[dict(id='x',pd=.2,defaulted=2,ead=10,lgd=.4)]),
    dict(rows=[dict(id='x',pd=.2,defaulted=0,ead=10,lgd=.4)]*2)])
def test_reject_bad_cohorts(changes):
    with pytest.raises(ValidationError):
        cohort(**changes)


def test_api_analysis_journey_and_invalid_input():
    client = TestClient(app)
    payload = dict(pd=.1,lgd=.4,ead=10000,annual_rate=.12,funding_rate=.04,operating_cost=100)
    response = client.post('/analysis/lending', json=payload)
    assert response.status_code == 200
    assert response.json()['expected_loss'] == pytest.approx(400)
    payload['pd'] = -1
    assert client.post('/analysis/lending', json=payload).status_code == 422
    report = client.post('/analysis/cohort', json=cohort().model_dump())
    assert report.status_code == 200
    assert report.json()['source'] == 'Hand-calculated fixture'
