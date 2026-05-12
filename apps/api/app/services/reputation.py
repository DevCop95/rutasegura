from app.models.user import User


def rank_for_score(score: int) -> str:
    if score >= 150:
        return "EMBAJADOR"
    if score >= 50:
        return "VERIFICADOR"
    if score >= 10:
        return "COLABORADOR"
    return "CIUDADANO"


def vote_weight_for_user(user: User) -> int:
    if user.reputation_score >= 150:
        return 4
    if user.reputation_score >= 50:
        return 3
    if user.reputation_score >= 10:
        return 2
    return 1
