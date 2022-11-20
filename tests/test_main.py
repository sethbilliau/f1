from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_home():
    response = client.get(
        "/", headers={"content-type": "text/html; charset=utf-8"})
    assert response.status_code == 200
    assert b"Team Orders" in response.content
    response = client.get("/static/css/style3.css")
    assert response.status_code == 200


def test_unlimited():
    response = client.get("/unlimited",
                          headers={"content-type": "text/html; charset=utf-8"})
    assert response.status_code == 200
    assert b"New Game" in response.content


def test_explore():
    response = client.get("/explore",
                          headers={"content-type": "text/html; charset=utf-8"})
    assert response.status_code == 200
    assert b"Team Orders" in response.content
