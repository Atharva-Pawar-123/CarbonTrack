import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_get_user_goals(async_client: AsyncClient):
    """Test retrieving goals for the authenticated user."""
    # Create user and get token
    await async_client.post("/auth/register", json={
        "email": "goalsuser@example.com",
        "display_name": "goalsuser",
        "password": "Password123!"
    })
    res = await async_client.post("/auth/login", json={"email": "goalsuser@example.com", "password": "Password123!"})
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch goals (should be empty initially)
    res = await async_client.get("/goals/", headers=headers)
    assert res.status_code == 200
    assert res.json() == []

@pytest.mark.asyncio
async def test_create_goal(async_client: AsyncClient):
    """Test creating a new goal."""
    # Create user and get token
    await async_client.post("/auth/register", json={
        "email": "goalscreate@example.com",
        "display_name": "goalscreate",
        "password": "Password123!"
    })
    res = await async_client.post("/auth/login", json={"email": "goalscreate@example.com", "password": "Password123!"})
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create a goal
    goal_data = {
        "target_month": "2026-12",
        "target_kg": 500.0,
        "description": "Eat vegetarian 3 times a week"
    }
    res = await async_client.post("/goals/", json=goal_data, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["target_month"] == "2026-12"
    assert data["is_achieved"] == False

    # Retrieve to verify
    res = await async_client.get("/goals/", headers=headers)
    assert len(res.json()) == 1
    assert res.json()[0]["id"] == data["id"]
