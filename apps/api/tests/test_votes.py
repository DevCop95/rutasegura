from datetime import datetime, timezone

from fastapi.testclient import TestClient

from conftest import auth_headers, register_and_login


def _create_report(client: TestClient, token: str) -> str:
    payload = {
        "title": "Acoso reportado en el bulevar",
        "description": "Una persona sospechosa siguio a varias mujeres en la zona.",
        "incident_category": "Acoso",
        "occurred_at": datetime.now(timezone.utc).isoformat(),
        "lat": "10.4236",
        "lng": "-75.5478",
        "city": "Cartagena",
        "neighborhood": "Manga",
    }
    response = client.post("/api/v1/reports", json=payload, headers=auth_headers(token))
    assert response.status_code == 201, response.text
    return response.json()["id"]


def test_creator_cannot_vote_own_report(client: TestClient) -> None:
    token = register_and_login(client, "creator@example.com")
    report_id = _create_report(client, token)

    response = client.post(
        f"/api/v1/reports/{report_id}/votes",
        json={"vote_value": "SI"},
        headers=auth_headers(token),
    )
    assert response.status_code == 400


def test_vote_registers_and_updates_summary(client: TestClient) -> None:
    creator_token = register_and_login(client, "creator2@example.com")
    voter_token = register_and_login(client, "voter1@example.com")
    report_id = _create_report(client, creator_token)

    response = client.post(
        f"/api/v1/reports/{report_id}/votes",
        json={"vote_value": "SI"},
        headers=auth_headers(voter_token),
    )
    assert response.status_code == 201, response.text
    data = response.json()
    assert data["yes"] == 1
    assert data["no"] == 0

    summary = client.get(f"/api/v1/reports/{report_id}/votes/summary")
    assert summary.json()["yes"] == 1


def test_cannot_vote_twice_on_same_report(client: TestClient) -> None:
    creator_token = register_and_login(client, "creator3@example.com")
    voter_token = register_and_login(client, "voter2@example.com")
    report_id = _create_report(client, creator_token)

    first = client.post(
        f"/api/v1/reports/{report_id}/votes",
        json={"vote_value": "SI"},
        headers=auth_headers(voter_token),
    )
    assert first.status_code == 201

    second = client.post(
        f"/api/v1/reports/{report_id}/votes",
        json={"vote_value": "NO"},
        headers=auth_headers(voter_token),
    )
    assert second.status_code == 409


def test_report_becomes_community_trusted_after_enough_yes_votes(client: TestClient) -> None:
    creator_token = register_and_login(client, "creator4@example.com")
    report_id = _create_report(client, creator_token)

    # 5 decisive votes with a >=70% yes ratio flips the report to
    # COMUNITARIAMENTE_CONFIABLE (see app/services/votes.py).
    for i in range(5):
        voter_token = register_and_login(client, f"trusted-voter{i}@example.com")
        response = client.post(
            f"/api/v1/reports/{report_id}/votes",
            json={"vote_value": "SI"},
            headers=auth_headers(voter_token),
        )
        assert response.status_code == 201

    report = client.get(f"/api/v1/reports/{report_id}")
    assert report.json()["status"] == "COMUNITARIAMENTE_CONFIABLE"


def test_vote_on_missing_report_returns_404(client: TestClient) -> None:
    token = register_and_login(client, "voter-missing@example.com")
    response = client.post(
        "/api/v1/reports/00000000-0000-0000-0000-000000000000/votes",
        json={"vote_value": "SI"},
        headers=auth_headers(token),
    )
    assert response.status_code == 404
