from app.services.reputation import rank_for_score


def test_rank_for_score() -> None:
    assert rank_for_score(0) == "CIUDADANO"
    assert rank_for_score(10) == "COLABORADOR"
    assert rank_for_score(50) == "VERIFICADOR"
    assert rank_for_score(150) == "EMBAJADOR"
