from datetime import datetime, timedelta, timezone

from fastapi.testclient import TestClient

from conftest import auth_headers, make_admin_token, register_and_login


def _report_payload(**overrides) -> dict:
    payload = {
        "title": "Robo en la esquina principal",
        "description": "Se reporto un hurto a mano armada cerca del parque.",
        "incident_category": "Hurto",
        "occurred_at": datetime.now(timezone.utc).isoformat(),
        "lat": "10.4236",
        "lng": "-75.5478",
        "city": "Cartagena",
        "neighborhood": "Manga",
        "is_womens_mode_relevant": False,
    }
    payload.update(overrides)
    return payload


def test_create_report_requires_auth(client: TestClient) -> None:
    response = client.post("/api/v1/reports", json=_report_payload())
    assert response.status_code == 401


def test_create_report_success(client: TestClient) -> None:
    token = register_and_login(client, "reporter@example.com")
    response = client.post("/api/v1/reports", json=_report_payload(), headers=auth_headers(token))
    assert response.status_code == 201, response.text
    data = response.json()
    assert data["status"] == "NO_VERIFICADO"
    assert data["city"] == "Cartagena"


def test_create_report_accepts_coordinates_outside_cartagena(client: TestClient) -> None:
    # Regression guard: per-city bounds are enforced client-side, the API
    # should only reject truly invalid (out-of-world) coordinates.
    token = register_and_login(client, "bogota-reporter@example.com")
    response = client.post(
        "/api/v1/reports",
        json=_report_payload(city="Bogota", lat="4.7110", lng="-74.0721"),
        headers=auth_headers(token),
    )
    assert response.status_code == 201, response.text


def test_create_report_rejects_future_date(client: TestClient) -> None:
    token = register_and_login(client, "future-reporter@example.com")
    future = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
    response = client.post(
        "/api/v1/reports", json=_report_payload(occurred_at=future), headers=auth_headers(token)
    )
    assert response.status_code == 422


def test_create_report_rejects_ancient_date(client: TestClient) -> None:
    token = register_and_login(client, "ancient-reporter@example.com")
    ancient = (datetime.now(timezone.utc) - timedelta(days=900)).isoformat()
    response = client.post(
        "/api/v1/reports", json=_report_payload(occurred_at=ancient), headers=auth_headers(token)
    )
    assert response.status_code == 422


def test_duplicate_report_links_to_parent(client: TestClient) -> None:
    token = register_and_login(client, "dup-reporter@example.com")
    now = datetime.now(timezone.utc).isoformat()

    first = client.post(
        "/api/v1/reports",
        json=_report_payload(occurred_at=now, lat="10.4236", lng="-75.5478"),
        headers=auth_headers(token),
    )
    assert first.status_code == 201
    parent_id = first.json()["id"]

    # Very close in space (~15m) and time, same category/city -> should merge into the parent.
    second = client.post(
        "/api/v1/reports",
        json=_report_payload(occurred_at=now, lat="10.42365", lng="-75.54785"),
        headers=auth_headers(token),
    )
    assert second.status_code == 201
    assert second.json()["parent_report_id"] == parent_id

    parent = client.get(f"/api/v1/reports/{parent_id}")
    assert parent.json()["duplicate_group_count"] == 1


def test_list_reports_hides_hidden_and_rejected_by_default(client: TestClient) -> None:
    token = register_and_login(client, "hidden-reporter@example.com")
    admin_token = make_admin_token(client)

    response = client.post("/api/v1/reports", json=_report_payload(), headers=auth_headers(token))
    report_id = response.json()["id"]

    hide = client.post(
        f"/api/v1/admin/reports/{report_id}/hide",
        json={"reason": "Contiene datos personales"},
        headers=auth_headers(admin_token),
    )
    assert hide.status_code == 200

    listed = client.get("/api/v1/reports?city=Cartagena")
    assert all(item["id"] != report_id for item in listed.json())

    # Still retrievable if explicitly asked for via the status filter.
    listed_hidden = client.get("/api/v1/reports?city=Cartagena&status=OCULTO")
    assert any(item["id"] == report_id for item in listed_hidden.json())


def test_get_report_not_found(client: TestClient) -> None:
    response = client.get("/api/v1/reports/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404
