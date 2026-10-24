import csv
import io
import json
import os
import random
from flask import Flask, render_template, request, jsonify, Response

app = Flask(__name__)

DATA_FILE = os.path.join(os.path.dirname(__file__), "data", "quotes.json")

def load_quotes():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

QUOTES = load_quotes()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "total_quotes": len(QUOTES)
    })

@app.route("/api/quotes/random", methods=["GET"])
def get_random_quote():
    category = request.args.get("category", "").strip().lower()
    author = request.args.get("author", "").strip().lower()
    exclude_id = request.args.get("exclude_id", type=int)

    candidates = QUOTES

    if category and category != "all":
        candidates = [q for q in candidates if q["category"].lower() == category]

    if author and author != "all":
        candidates = [q for q in candidates if author in q["author"].lower()]

    if not candidates:
        return jsonify({
            "status": "error",
            "message": "No quotes match the specified criteria."
        }), 404

    # If more than 1 candidate and exclude_id specified, try to exclude previous quote
    filtered_candidates = [q for q in candidates if q["id"] != exclude_id] if len(candidates) > 1 else candidates
    selected = random.choice(filtered_candidates if filtered_candidates else candidates)

    return jsonify({
        "status": "success",
        "data": selected
    })

@app.route("/api/quotes", methods=["GET"])
def get_quotes():
    q = request.args.get("q", "").strip().lower()
    category = request.args.get("category", "").strip().lower()
    author = request.args.get("author", "").strip().lower()

    results = QUOTES

    if category and category != "all":
        results = [quote for quote in results if quote["category"].lower() == category]

    if author and author != "all":
        results = [quote for quote in results if author in quote["author"].lower()]

    if q:
        results = [
            quote for quote in results
            if q in quote["quote"].lower()
            or q in quote["author"].lower()
            or q in quote["category"].lower()
        ]

    return jsonify({
        "status": "success",
        "total": len(QUOTES),
        "count": len(results),
        "data": results
    })

@app.route("/api/quotes/export", methods=["GET"])
def export_quotes_csv():
    q = request.args.get("q", "").strip().lower()
    category = request.args.get("category", "").strip().lower()
    author = request.args.get("author", "").strip().lower()

    results = QUOTES

    if category and category != "all":
        results = [quote for quote in results if quote["category"].lower() == category]

    if author and author != "all":
        results = [quote for quote in results if author in quote["author"].lower()]

    if q:
        results = [
            quote for quote in results
            if q in quote["quote"].lower()
            or q in quote["author"].lower()
            or q in quote["category"].lower()
        ]

    output = io.StringIO()
    writer = csv.writer(output, quoting=csv.QUOTE_ALL)
    writer.writerow(["ID", "Quote", "Author", "Category"])
    for item in results:
        writer.writerow([item["id"], item["quote"], item["author"], item["category"]])

    return Response(
        output.getvalue(),
        mimetype="text/csv; charset=utf-8",
        headers={"Content-Disposition": "attachment; filename=quotes.csv"}
    )

@app.route("/api/categories", methods=["GET"])
def get_categories():
    categories = {}
    for q in QUOTES:
        cat = q["category"]
        categories[cat] = categories.get(cat, 0) + 1

    sorted_categories = [
        {"name": cat, "count": count}
        for cat, count in sorted(categories.items())
    ]

    return jsonify({
        "status": "success",
        "total": len(sorted_categories),
        "data": sorted_categories
    })

@app.route("/api/authors", methods=["GET"])
def get_authors():
    authors = {}
    for q in QUOTES:
        author = q["author"]
        authors[author] = authors.get(author, 0) + 1

    sorted_authors = [
        {"name": author, "count": count}
        for author, count in sorted(authors.items())
    ]

    return jsonify({
        "status": "success",
        "total": len(sorted_authors),
        "data": sorted_authors
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    print(f"\n🚀 QuoteVault server running at http://127.0.0.1:{port}\n")
    app.run(debug=True, host="127.0.0.1", port=port)
