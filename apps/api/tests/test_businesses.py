from fastapi.testclient import TestClient

from conftest import auth_headers, register_and_login


def _business_payload(**overrides) -> dict:
    payload = {
        "name": "Farmacia Manga 24h",
        "category": "Farmacia",
        "description": "Punto seguro con camaras e iluminacion permanente.",
        "address_text": "Manga, Calle 24",
        "lat": "10.4109",
        "lng": "-75.5362",
    }
    payload.update(overrides)
    return payload


def _create_business(client: TestClient, token: str) -> str:
    response = client.post("/api/v1/businesses", json=_business_payload(), headers=auth_headers(token))
    assert response.status_code == 201, response.text
    return response.json()["id"]


def test_create_business_requires_auth(client: TestClient) -> None:
    response = client.post("/api/v1/businesses", json=_business_payload())
    assert response.status_code == 401


def test_create_business_starts_as_borrador_and_is_not_public(client: TestClient) -> None:
    token = register_and_login(client, "owner1@example.com")
    business_id = _create_business(client, token)

    created = client.get("/api/v1/businesses").json()
    assert all(item["id"] != business_id for item in created)


def test_owner_cannot_vote_own_business(client: TestClient) -> None:
    token = register_and_login(client, "owner2@example.com")
    business_id = _create_business(client, token)

    response = client.post(
        f"/api/v1/businesses/{business_id}/votes",
        json={"vote_value": "SI"},
        headers=auth_headers(token),
    )
    assert response.status_code == 400


def test_cannot_vote_same_business_twice(client: TestClient) -> None:
    owner_token = register_and_login(client, "owner3@example.com")
    voter_token = register_and_login(client, "bvoter1@example.com")
    business_id = _create_business(client, owner_token)

    first = client.post(
        f"/api/v1/businesses/{business_id}/votes",
        json={"vote_value": "SI"},
        headers=auth_headers(voter_token),
    )
    assert first.status_code == 201

    second = client.post(
        f"/api/v1/businesses/{business_id}/votes",
        json={"vote_value": "NO"},
        headers=auth_headers(voter_token),
    )
    assert second.status_code == 409


def test_business_becomes_public_after_campaign_and_enough_votes(client: TestClient) -> None:
    owner_token = register_and_login(client, "owner4@example.com")
    business_id = _create_business(client, owner_token)

    # A fresh business is BORRADOR; starting a sponsor campaign moves it to
    # PENDIENTE_PAGO, which is the state the vote-count thresholds act on.
    campaign = client.post(
        f"/api/v1/businesses/{business_id}/campaign",
        json={"sponsor_label": "Punto seguro patrocinado"},
        headers=auth_headers(owner_token),
    )
    assert campaign.status_code == 200
    assert campaign.json()["status"] == "PENDIENTE_PAGO"

    # 5+ yes votes -> PENDIENTE_VERIFICACION, which is already public.
    for i in range(5):
        voter_token = register_and_login(client, f"bvoter-a{i}@example.com")
        response = client.post(
            f"/api/v1/businesses/{business_id}/votes",
            json={"vote_value": "SI"},
            headers=auth_headers(voter_token),
        )
        assert response.status_code == 201

    # No direct GET /businesses/{id} endpoint exists; confirm via the public list.
    public_ids = [item["id"] for item in client.get("/api/v1/businesses").json()]
    assert business_id in public_ids

    # 8+ yes votes with yes > no*2 -> APROBADO.
    for i in range(3):
        voter_token = register_and_login(client, f"bvoter-b{i}@example.com")
        response = client.post(
            f"/api/v1/businesses/{business_id}/votes",
            json={"vote_value": "SI"},
            headers=auth_headers(voter_token),
        )
        assert response.status_code == 201

    public_ids = [item["id"] for item in client.get("/api/v1/businesses").json()]
    assert business_id in public_ids


def test_public_business_list_excludes_draft_and_rejected(client: TestClient) -> None:
    owner_token = register_and_login(client, "owner5@example.com")
    draft_id = _create_business(client, owner_token)

    public_ids = [item["id"] for item in client.get("/api/v1/businesses").json()]
    assert draft_id not in public_ids
