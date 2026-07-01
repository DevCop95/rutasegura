from datetime import datetime, timezone

from fastapi.testclient import TestClient

from conftest import auth_headers, make_admin_token, register_and_login


def _create_report(client: TestClient, token: str) -> str:
    payload = {
        "title": "Explosion reportada cerca del mercado",
        "description": "Varios testigos escucharon una fuerte explosion en la zona.",
        "incident_category": "Alerta",
        "occurred_at": datetime.now(timezone.utc).isoformat(),
        "lat": "10.4236",
        "lng": "-75.5478",
        "city": "Cartagena",
        "neighborhood": "Manga",
    }
    response = client.post("/api/v1/reports", json=payload, headers=auth_headers(token))
    assert response.status_code == 201, response.text
    return response.json()["id"]


def test_submit_source_requires_auth(client: TestClient) -> None:
    reporter_token = register_and_login(client, "src-reporter1@example.com")
    report_id = _create_report(client, reporter_token)

    # login()/verify() leave a session cookie on the shared TestClient; clear
    # it so this request is genuinely unauthenticated.
    client.cookies.clear()
    response = client.post(f"/api/v1/reports/{report_id}/sources", json={"url": "https://noticia.com/articulo"})
    assert response.status_code == 401


def test_any_logged_in_user_can_submit_source(client: TestClient) -> None:
    reporter_token = register_and_login(client, "src-reporter2@example.com")
    citizen_token = register_and_login(client, "src-citizen@example.com")
    report_id = _create_report(client, reporter_token)

    response = client.post(
        f"/api/v1/reports/{report_id}/sources",
        json={"url": "https://noticia.com/articulo-real"},
        headers=auth_headers(citizen_token),
    )
    assert response.status_code == 201, response.text
    assert response.json()["status"] == "PENDIENTE"

    listed = client.get(f"/api/v1/reports/{report_id}/sources").json()
    assert len(listed) == 1


def test_duplicate_source_url_is_rejected(client: TestClient) -> None:
    reporter_token = register_and_login(client, "src-reporter3@example.com")
    report_id = _create_report(client, reporter_token)

    payload = {"url": "https://noticia.com/misma-nota"}
    first = client.post(f"/api/v1/reports/{report_id}/sources", json=payload, headers=auth_headers(reporter_token))
    assert first.status_code == 201

    second = client.post(f"/api/v1/reports/{report_id}/sources", json=payload, headers=auth_headers(reporter_token))
    assert second.status_code == 409


def test_only_admin_can_accept_or_reject_sources(client: TestClient) -> None:
    reporter_token = register_and_login(client, "src-reporter4@example.com")
    report_id = _create_report(client, reporter_token)
    source = client.post(
        f"/api/v1/reports/{report_id}/sources",
        json={"url": "https://noticia.com/pendiente"},
        headers=auth_headers(reporter_token),
    ).json()

    accept = client.post(
        f"/api/v1/admin/sources/{source['id']}/accept",
        json={},
        headers=auth_headers(reporter_token),
    )
    assert accept.status_code == 403


def test_accepting_source_verifies_report(client: TestClient) -> None:
    reporter_token = register_and_login(client, "src-reporter5@example.com")
    admin_token = make_admin_token(client)
    report_id = _create_report(client, reporter_token)

    source = client.post(
        f"/api/v1/reports/{report_id}/sources",
        json={"url": "https://noticia.com/confirmado"},
        headers=auth_headers(reporter_token),
    ).json()

    accept = client.post(
        f"/api/v1/admin/sources/{source['id']}/accept",
        json={"review_notes": "Coincide con el reporte"},
        headers=auth_headers(admin_token),
    )
    assert accept.status_code == 200
    assert accept.json()["status"] == "ACEPTADO"

    report = client.get(f"/api/v1/reports/{report_id}").json()
    assert report["status"] == "VERIFICADO"
    assert report["report_type"] == "OFICIAL"


def test_rejecting_source_does_not_verify_report(client: TestClient) -> None:
    reporter_token = register_and_login(client, "src-reporter6@example.com")
    admin_token = make_admin_token(client)
    report_id = _create_report(client, reporter_token)

    source = client.post(
        f"/api/v1/reports/{report_id}/sources",
        json={"url": "https://noticia.com/no-relacionada"},
        headers=auth_headers(reporter_token),
    ).json()

    reject = client.post(
        f"/api/v1/admin/sources/{source['id']}/reject",
        json={"reason": "El articulo no coincide con este incidente"},
        headers=auth_headers(admin_token),
    )
    assert reject.status_code == 200
    assert reject.json()["status"] == "RECHAZADO"

    report = client.get(f"/api/v1/reports/{report_id}").json()
    assert report["status"] == "NO_VERIFICADO"
    assert report["report_type"] == "INSTANTANEO"


def test_cannot_review_source_twice(client: TestClient) -> None:
    reporter_token = register_and_login(client, "src-reporter7@example.com")
    admin_token = make_admin_token(client)
    report_id = _create_report(client, reporter_token)

    source = client.post(
        f"/api/v1/reports/{report_id}/sources",
        json={"url": "https://noticia.com/ya-revisada"},
        headers=auth_headers(reporter_token),
    ).json()

    first = client.post(
        f"/api/v1/admin/sources/{source['id']}/accept",
        json={},
        headers=auth_headers(admin_token),
    )
    assert first.status_code == 200

    second = client.post(
        f"/api/v1/admin/sources/{source['id']}/reject",
        json={"reason": "Cambio de opinion tardio"},
        headers=auth_headers(admin_token),
    )
    assert second.status_code == 400
