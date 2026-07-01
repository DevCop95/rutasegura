from datetime import datetime, timedelta, timezone

from fastapi.testclient import TestClient

from conftest import auth_headers, make_admin_token, register_and_login


def _create_report(client: TestClient, token: str, **overrides) -> str:
    payload = {
        "title": "Reporte de prueba para administracion",
        "description": "Descripcion suficientemente larga para pasar la validacion.",
        "incident_category": "Hurto",
        "occurred_at": datetime.now(timezone.utc).isoformat(),
        "lat": "10.4236",
        "lng": "-75.5478",
        "city": "Cartagena",
        "neighborhood": "Manga",
    }
    payload.update(overrides)
    response = client.post("/api/v1/reports", json=payload, headers=auth_headers(token))
    assert response.status_code == 201, response.text
    return response.json()["id"]


def test_admin_endpoints_reject_regular_users(client: TestClient) -> None:
    token = register_and_login(client, "regular@example.com")
    response = client.get("/api/v1/admin/reports", headers=auth_headers(token))
    assert response.status_code == 403


def test_admin_endpoints_require_auth(client: TestClient) -> None:
    response = client.get("/api/v1/admin/reports")
    assert response.status_code == 401


def test_admin_hide_and_restore_report(client: TestClient) -> None:
    reporter_token = register_and_login(client, "reporter-admin1@example.com")
    admin_token = make_admin_token(client)
    report_id = _create_report(client, reporter_token)

    hide = client.post(
        f"/api/v1/admin/reports/{report_id}/hide",
        json={"reason": "Contiene datos personales identificables"},
        headers=auth_headers(admin_token),
    )
    assert hide.status_code == 200
    assert hide.json()["status"] == "OCULTO"

    restore = client.post(
        f"/api/v1/admin/reports/{report_id}/restore",
        headers=auth_headers(admin_token),
    )
    assert restore.status_code == 200
    assert restore.json()["status"] == "NO_VERIFICADO"


def test_admin_can_merge_duplicate_reports(client: TestClient) -> None:
    reporter_token = register_and_login(client, "reporter-admin2@example.com")
    admin_token = make_admin_token(client)

    # Different timestamps so the automatic duplicate detector doesn't merge
    # them on creation; the merge here is an explicit admin action instead.
    parent_id = _create_report(client, reporter_token, occurred_at=datetime.now(timezone.utc).isoformat())
    child_id = _create_report(
        client,
        reporter_token,
        occurred_at=(datetime.now(timezone.utc) - timedelta(hours=10)).isoformat(),
    )

    merge = client.post(
        f"/api/v1/admin/reports/{child_id}/duplicate",
        json={"parent_report_id": parent_id},
        headers=auth_headers(admin_token),
    )
    assert merge.status_code == 200, merge.text
    assert merge.json()["parent_report_id"] == parent_id

    parent = client.get(f"/api/v1/reports/{parent_id}")
    assert parent.json()["duplicate_group_count"] == 1


def test_admin_merge_rejects_self_parent(client: TestClient) -> None:
    reporter_token = register_and_login(client, "reporter-admin3@example.com")
    admin_token = make_admin_token(client)
    report_id = _create_report(client, reporter_token)

    merge = client.post(
        f"/api/v1/admin/reports/{report_id}/duplicate",
        json={"parent_report_id": report_id},
        headers=auth_headers(admin_token),
    )
    assert merge.status_code == 400


def test_admin_merge_rejects_circular_chain(client: TestClient) -> None:
    reporter_token = register_and_login(client, "reporter-admin4@example.com")
    admin_token = make_admin_token(client)

    report_c = _create_report(client, reporter_token, occurred_at=datetime.now(timezone.utc).isoformat())
    report_d = _create_report(
        client,
        reporter_token,
        occurred_at=(datetime.now(timezone.utc) - timedelta(hours=10)).isoformat(),
    )

    # D -> C
    first_merge = client.post(
        f"/api/v1/admin/reports/{report_d}/duplicate",
        json={"parent_report_id": report_c},
        headers=auth_headers(admin_token),
    )
    assert first_merge.status_code == 200

    # Now trying C -> D would close the loop (C -> D -> C) and must be rejected.
    second_merge = client.post(
        f"/api/v1/admin/reports/{report_c}/duplicate",
        json={"parent_report_id": report_d},
        headers=auth_headers(admin_token),
    )
    assert second_merge.status_code == 400


def test_admin_reject_business(client: TestClient) -> None:
    owner_token = register_and_login(client, "biz-owner-admin@example.com")
    admin_token = make_admin_token(client)

    business = client.post(
        "/api/v1/businesses",
        json={
            "name": "Negocio de prueba",
            "category": "Comercio",
            "lat": "10.4109",
            "lng": "-75.5362",
        },
        headers=auth_headers(owner_token),
    )
    business_id = business.json()["id"]

    reject = client.post(
        f"/api/v1/admin/businesses/{business_id}/reject",
        json={"reason": "Informacion de contacto invalida"},
        headers=auth_headers(admin_token),
    )
    assert reject.status_code == 200
    assert reject.json()["status"] == "RECHAZADO"

    # Rejected businesses stay off the public listing.
    public_ids = [item["id"] for item in client.get("/api/v1/businesses").json()]
    assert business_id not in public_ids

    # But the admin listing still shows every business regardless of status.
    admin_ids = [
        item["id"]
        for item in client.get("/api/v1/admin/businesses", headers=auth_headers(admin_token)).json()
    ]
    assert business_id in admin_ids
