import json
from fastapi.testclient import TestClient
from app.main import app


client = TestClient(app)


def test_courses_crud_and_assignment_and_linkage(monkeypatch):
    # Create a course with aliases
    r = client.post(
        "/courses",
        headers={"Authorization": "Bearer devsecret123"},
        json={"name": "CS 201", "aliases": ["Data Structures", "CS201"], "color": "#1E90FF"},
    )
    assert r.status_code == 200
    course = r.json()
    assert course["name"] == "CS 201"
    assert "aliases" in course and "CS201" in course["aliases"]

    # List courses
    r = client.get("/courses", headers={"Authorization": "Bearer devsecret123"})
    assert r.status_code == 200
    listed = r.json()
    assert any(c.get("name") == "CS 201" for c in listed)

    # Creating the same course by name should return the same one (idempotent)
    r_dup = client.post(
        "/courses",
        headers={"Authorization": "Bearer devsecret123"},
        json={"name": "CS 201"},
    )
    assert r_dup.status_code == 200
    dup = r_dup.json()
    assert dup["id"] == course["id"]

    # Create a session and add transcript mentioning an alias
    r = client.post("/sessions", headers={"Authorization": "Bearer devsecret123"}, json={"title": "Lecture 1"})
    assert r.status_code == 200
    sid = r.json()["id"]
    client.post(
        "/webhooks/mentra",
        headers={"X-Webhook-Token": "mentra_webhook_secret"},
        json={
            "session_id": sid,
            "chunks": [
                {"text": "Today we studied basic Data Structures.", "ts_start": 0, "ts_end": 10, "bookmarked": True},
            ],
        },
    )

    # Suggest should pick up the course by alias
    r = client.get(f"/sessions/{sid}/class:suggest", headers={"Authorization": "Bearer devsecret123"})
    assert r.status_code == 200
    candidates = r.json().get("candidates", [])
    assert any(c.get("name") == "CS 201" for c in candidates)

    # Assign the course by name
    r = client.post(
        f"/sessions/{sid}/class:assign",
        headers={"Authorization": "Bearer devsecret123"},
        json={"name": "CS 201"},
    )
    assert r.status_code == 200
    course_id = r.json().get("course_id")
    assert isinstance(course_id, str)

    # Generate flashcards and ensure they are linked to the course
    r = client.post(
        f"/sessions/{sid}/flashcards:generate-sync",
        headers={"Authorization": "Bearer devsecret123"},
        json={"types": ["qa"], "max_per_type": 1},
    )
    assert r.status_code == 200

    # Verify linkage in DB
    from app.db.session import get_session
    from app.models.entities import Flashcard, FlashcardCourse, SessionCourse
    with get_session() as db:
        sc = db.query(SessionCourse).filter(SessionCourse.session_id == sid).first()
        assert sc is not None and sc.course_id == course_id
        fcs = (
            db.query(FlashcardCourse)
            .join(Flashcard, FlashcardCourse.flashcard_id == Flashcard.id)
            .filter(Flashcard.session_id == sid)
            .all()
        )
        # At least one flashcard should be linked to the course
        assert any(fc.course_id == course_id for fc in fcs)


def test_class_assign_errors():
    # Missing both course_id and name
    r = client.post(
        f"/sessions/does-not-exist/class:assign",
        headers={"Authorization": "Bearer devsecret123"},
        json={"name": "X"},
    )
    assert r.status_code in (400, 404)

    # Create session
    r = client.post("/sessions", headers={"Authorization": "Bearer devsecret123"}, json={"title": "Err"})
    assert r.status_code == 200
    sid = r.json()["id"]

    # Missing payload
    r = client.post(f"/sessions/{sid}/class:assign", headers={"Authorization": "Bearer devsecret123"}, json={})
    assert r.status_code == 400


def test_courses_auth_protection():
    r = client.post("/courses", json={"name": "NoAuth"})
    assert r.status_code == 401
    r = client.get("/courses")
    assert r.status_code == 401
    r = client.get("/sessions/abc/class:suggest")
    assert r.status_code == 401
    r = client.post("/sessions/abc/class:assign", json={"name": "X"})
    assert r.status_code == 401
