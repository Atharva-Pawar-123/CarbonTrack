import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_user(async_client: AsyncClient):
    """Test that a new user can register successfully."""
    payload = {
        "email": "test@example.com",
        "password": "StrongPassword123!",
        "display_name": "Test User"
    }
    response = await async_client.post("/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["email"] == payload["email"]
    assert data["display_name"] == payload["display_name"]


@pytest.mark.asyncio
async def test_register_existing_user(async_client: AsyncClient):
    """Test that registering with an existing email returns 409 Conflict."""
    payload = {
        "email": "test2@example.com",
        "password": "StrongPassword123!",
        "display_name": "Test User 2"
    }
    # Create user
    await async_client.post("/auth/register", json=payload)
    # Try again — should conflict
    response = await async_client.post("/auth/register", json=payload)
    assert response.status_code == 409
    assert "already exists" in response.json()["detail"]


@pytest.mark.asyncio
async def test_register_weak_password(async_client: AsyncClient):
    """Test that a weak password is rejected with 422."""
    payload = {
        "email": "weakpw@example.com",
        "password": "short",
        "display_name": "Weak PW User"
    }
    response = await async_client.post("/auth/register", json=payload)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_login_user(async_client: AsyncClient):
    """Test that a registered user can log in and receive tokens."""
    payload = {
        "email": "testlogin@example.com",
        "password": "StrongPassword123!",
        "display_name": "Login User"
    }
    await async_client.post("/auth/register", json=payload)

    login_payload = {
        "email": "testlogin@example.com",
        "password": "StrongPassword123!"
    }
    response = await async_client.post("/auth/login", json=login_payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_invalid_credentials(async_client: AsyncClient):
    """Test that wrong credentials return 401 Unauthorized."""
    payload = {
        "email": "testlogin2@example.com",
        "password": "StrongPassword123!",
        "display_name": "Login User 2"
    }
    await async_client.post("/auth/register", json=payload)

    response = await async_client.post("/auth/login", json={
        "email": "testlogin2@example.com",
        "password": "WrongPassword!"
    })
    assert response.status_code == 401
    assert "Invalid credentials" in response.json()["detail"]


@pytest.mark.asyncio
async def test_get_current_user(async_client: AsyncClient):
    """Test the /auth/me endpoint returns the authenticated user."""
    await async_client.post("/auth/register", json={
        "email": "meuser@example.com",
        "password": "StrongPassword123!",
        "display_name": "Me User"
    })
    login_resp = await async_client.post("/auth/login", json={
        "email": "meuser@example.com",
        "password": "StrongPassword123!"
    })
    token = login_resp.json()["access_token"]

    response = await async_client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "meuser@example.com"
    assert data["display_name"] == "Me User"


@pytest.mark.asyncio
async def test_refresh_token(async_client: AsyncClient):
    """Test that a valid refresh token yields a new access token."""
    await async_client.post("/auth/register", json={
        "email": "refresh@example.com",
        "password": "StrongPassword123!",
        "display_name": "Refresh User"
    })
    login_resp = await async_client.post("/auth/login", json={
        "email": "refresh@example.com",
        "password": "StrongPassword123!"
    })
    refresh_token = login_resp.json()["refresh_token"]

    response = await async_client.post("/auth/refresh", json={
        "refresh_token": refresh_token
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
