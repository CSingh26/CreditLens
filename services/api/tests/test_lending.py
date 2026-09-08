import pytest
from pydantic import ValidationError

from app.lending import LendingInput, analyze_lending


def terms(**kwargs):
    return LendingInput(**dict(pd=.1, lgd=.4, ead=10000, annual_rate=.12,
                               funding_rate=.04, operating_cost=100, **kwargs))


def test_hand_calculated_expected_loss_and_break_even():
    result = analyze_lending(terms())
    assert result['expected_loss'] == pytest.approx(400)
    assert result['expected_interest'] == pytest.approx(1080)
    assert result['expected_contribution'] == pytest.approx(180)
    assert result['break_even_rate'] == pytest.approx(.1)


def test_certain_default_has_no_finite_break_even_coupon():
    value = terms().model_copy(update={'pd': 1})
    assert analyze_lending(value)['break_even_rate'] is None


def test_stress_loss_increases_and_affordability_is_separate():
    value = terms(pd_multiplier=2, lgd_stress=.1, rate_shock=.02,
                  monthly_income=5000, monthly_debt=1000,
                  credit_balance=5000, credit_limit=10000)
    result = analyze_lending(value)
    assert result['stress']['expected_loss'] == pytest.approx(1000)
    assert result['stress']['expected_interest'] == pytest.approx(1120)
    assert result['debt_to_income'] == pytest.approx(.2)
    assert result['credit_utilization'] == pytest.approx(.5)
    assert result['monthly_cash_after_debt_and_interest'] == pytest.approx(3900)


@pytest.mark.parametrize('field,value', [('pd',-1), ('lgd',1.1), ('ead',0),
    ('ead',float('inf')), ('annual_rate',float('nan')), ('monthly_income',0),
    ('credit_limit',0), ('funding_rate',-1), ('pd_multiplier',-1)])
def test_invalid_inputs_rejected(field, value):
    data = terms().model_dump()
    data[field] = value
    with pytest.raises(ValidationError):
        LendingInput(**data)


def test_partial_affordability_input_rejected():
    with pytest.raises(ValidationError):
        terms(monthly_debt=100)
