import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_get_user_actions(async_client: AsyncClient):
    """Test retrieving actions for the authenticated user."""
    # Create user and get token
    await async_client.post("/auth/register", json={
        "email": "actionsuser@example.com",
        "display_name": "actionsuser",
        "password": "Password123!"
    })
    res = await async_client.post("/auth/login", json={"email": "actionsuser@example.com", "password": "Password123!"})
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch actions (should be empty initially)
    res = await async_client.get("/actions/summary", headers=headers)
    assert res.status_code == 200
    assert "total_co2e_saved_kg" in res.json()

@pytest.mark.asyncio
async def test_log_action(async_client: AsyncClient):
    """Test logging a new sustainable action."""
    # Create user and get token
    await async_client.post("/auth/register", json={
        "email": "actionslog@example.com",
        "display_name": "actionslog",
        "password": "Password123!"
    })
    res = await async_client.post("/auth/login", json={"email": "actionslog@example.com", "password": "Password123!"})
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Log an action
    action_data = {
        "action_id": "public_transport"
    }
    res = await async_client.post("/actions/", json=action_data, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["action_id"] == "public_transport"
    assert "co2e_saved_kg" in data

    # Retrieve to verify
    res = await async_client.get("/actions/summary", headers=headers)
    assert res.status_code == 200
    assert res.json()["total_co2e_saved_kg"] > 0
