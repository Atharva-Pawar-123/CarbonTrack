import pytest
from httpx import AsyncClient


@pytest.fixture
async def auth_headers(async_client: AsyncClient):
    """Register and login to get an auth token for protected routes."""
    await async_client.post(
        "/auth/register",
        json={
            "email": "emission@example.com",
            "password": "TestPassword123!",
            "display_name": "Emission User",
        },
    )
    response = await async_client.post(
        "/auth/login",
        json={"email": "emission@example.com", "password": "TestPassword123!"},
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


SAMPLE_FOOTPRINT = {
    "month": "2024-01",
    "transport": {
        "car_km": 500,
        "fuel_type": "petrol",
        "flight_km_short": 0,
        "flight_km_long": 0,
        "bus_km": 100,
        "metro_km": 50,
        "motorbike_km": 0,
    },
    "energy": {
        "electricity_kwh": 300,
        "gas_m3": 20,
        "lpg_cylinders": 0,
        "region_grid_factor": 0.82,
    },
    "diet": {"diet_type": "omnivore"},
    "consumption": {
        "clothing_items": 3,
        "electronics_bought": 1,
        "waste_recycling": "partial",
    },
}


@pytest.mark.asyncio
async def test_calculate_footprint(async_client: AsyncClient, auth_headers):
    """Test submitting a footprint calculation via POST /footprint/."""
    response = await async_client.post(
        "/footprint/", json=SAMPLE_FOOTPRINT, headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert "total_kg" in data
    assert data["total_kg"] > 0
    assert data["month"] == "2024-01"
    assert data["eco_score"] >= 0


@pytest.mark.asyncio
async def test_get_footprint_history(async_client: AsyncClient, auth_headers):
    """Test retrieving footprint history via GET /footprint/history."""
    # Submit a footprint first
    await async_client.post("/footprint/", json=SAMPLE_FOOTPRINT, headers=auth_headers)

    response = await async_client.get("/footprint/history", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "entries" in data
    assert "total" in data
    assert data["total"] >= 1
    assert data["entries"][0]["month"] == "2024-01"


@pytest.mark.asyncio
async def test_footprint_requires_auth(async_client: AsyncClient):
    """Test that footprint endpoints require authentication."""
    response = await async_client.post("/footprint/", json=SAMPLE_FOOTPRINT)
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_health_check(async_client: AsyncClient):
    """Test the /health endpoint returns a healthy status."""
    response = await async_client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}
