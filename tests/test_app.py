import json
import os
import pytest
from app import app, DATA_FILE

@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

def test_data_quotes_integrity():
    assert os.path.exists(DATA_FILE), "quotes.json must exist"
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        quotes = json.load(f)

    assert len(quotes) == 100, f"Expected exactly 100 quotes, found {len(quotes)}"

    seen_ids = set()
    for q in quotes:
        assert "id" in q and isinstance(q["id"], int)
        assert q["id"] not in seen_ids, f"Duplicate ID found: {q['id']}"
        seen_ids.add(q["id"])

        assert "quote" in q and isinstance(q["quote"], str) and len(q["quote"].strip()) > 0
        assert "author" in q and isinstance(q["author"], str) and len(q["author"].strip()) > 0
        assert "category" in q and isinstance(q["category"], str) and len(q["category"].strip()) > 0

def test_index_route(client):
    response = client.get("/")
    assert response.status_code == 200
    assert b"QuoteVault" in response.data
    assert b"100 Quotes" in response.data

def test_health_endpoint(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "ok"
    assert data["total_quotes"] == 100

def test_random_quote(client):
    response = client.get("/api/quotes/random")
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "success"
    quote = data["data"]
    assert "id" in quote
    assert "quote" in quote
    assert "author" in quote
    assert "category" in quote

def test_random_quote_with_filters(client):
    # Filter by category
    res_cat = client.get("/api/quotes/random?category=inspiration")
    assert res_cat.status_code == 200
    assert res_cat.get_json()["data"]["category"] == "Inspiration"

    # Filter by author
    res_author = client.get("/api/quotes/random?author=einstein")
    assert res_author.status_code == 200
    assert "einstein" in res_author.get_json()["data"]["author"].lower()

def test_all_quotes_list(client):
    response = client.get("/api/quotes")
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "success"
    assert data["total"] == 100
    assert data["count"] == 100
    assert len(data["data"]) == 100

def test_quotes_search_query(client):
    response = client.get("/api/quotes?q=future")
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "success"
    assert data["count"] > 0
    for item in data["data"]:
        text_match = "future" in item["quote"].lower()
        author_match = "future" in item["author"].lower()
        cat_match = "future" in item["category"].lower()
        assert text_match or author_match or cat_match

def test_quotes_category_filter(client):
    response = client.get("/api/quotes?category=humor+%26+wit")
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "success"
    assert data["count"] > 0
    for item in data["data"]:
        assert item["category"].lower() == "humor & wit"

def test_quotes_author_filter(client):
    response = client.get("/api/quotes?author=Steve+Jobs")
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "success"
    assert data["count"] >= 1
    assert data["data"][0]["author"] == "Steve Jobs"

def test_categories_endpoint(client):
    response = client.get("/api/categories")
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "success"
    categories = data["data"]
    assert len(categories) > 0
    total_count = sum(c["count"] for c in categories)
    assert total_count == 100

def test_authors_endpoint(client):
    response = client.get("/api/authors")
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "success"
    authors = data["data"]
    assert len(authors) > 0
    total_count = sum(a["count"] for a in authors)
    assert total_count == 100

def test_export_csv_endpoint(client):
    response = client.get("/api/quotes/export")
    assert response.status_code == 200
    assert "text/csv" in response.content_type
    assert "attachment; filename=quotes.csv" in response.headers.get("Content-Disposition", "")
    lines = response.data.decode("utf-8").strip().split("\r\n")
    if len(lines) == 1:
        lines = response.data.decode("utf-8").strip().split("\n")
    assert lines[0] == '"ID","Quote","Author","Category"'
    # Header + 100 quotes = 101 lines (ignoring embedded multiline quotes if any)
    assert len(lines) >= 101

def test_export_csv_filtered(client):
    response = client.get("/api/quotes/export?author=Einstein")
    assert response.status_code == 200
    assert "text/csv" in response.content_type
    content = response.data.decode("utf-8")
    assert "Albert Einstein" in content
    assert "Steve Jobs" not in content
