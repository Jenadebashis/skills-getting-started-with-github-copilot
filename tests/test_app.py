from fastapi.testclient import TestClient
from src.app import app
from urllib.parse import quote

client = TestClient(app)


def test_get_activities():
    resp = client.get("/activities")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, dict)
    # basic sanity checks
    assert "Chess Club" in data
    assert "participants" in data["Chess Club"]


def test_signup_and_unregister():
    activity = "Chess Club"
    email = "tester+pytest@example.com"

    # Ensure not present initially
    resp = client.get("/activities")
    assert resp.status_code == 200
    data = resp.json()
    assert email not in data[activity]["participants"]

    # Sign up
    signup_url = f"/activities/{quote(activity)}/signup?email={quote(email)}"
    resp = client.post(signup_url)
    assert resp.status_code == 200
    body = resp.json()
    assert "Signed up" in body.get("message", "")

    # Verify presence
    resp = client.get("/activities")
    data = resp.json()
    assert email in data[activity]["participants"]

    # Unregister
    del_url = f"/activities/{quote(activity)}/participants?email={quote(email)}"
    resp = client.delete(del_url)
    assert resp.status_code == 200
    body = resp.json()
    assert "Unregistered" in body.get("message", "")

    # Verify removed
    resp = client.get("/activities")
    data = resp.json()
    assert email not in data[activity]["participants"]
