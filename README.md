# 🌟 famous-quote (QuoteVault)

A responsive single-page web application built with **Python Flask** on the backend and **pure vanilla JavaScript, HTML5, and CSS3** on the frontend. It features a curated collection of **100 timeless and well-known quotes** spanning science, philosophy, history, literature, art, and leadership.

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.1.3-black.svg)](https://flask.palletsprojects.com/)
[![Vanilla JS](https://img.shields.io/badge/JavaScript-ES6%2B%20Vanilla-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Tests](https://img.shields.io/badge/Tests-11%20Passed-brightgreen.svg)](tests/test_app.py)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

---

## ✨ Features

- 🎲 **Quote of the Moment (Spotlight Hero)**:
  - Generates a random quote on initial page load and on clicking **"New Random Quote"**.
  - **Keyboard Shortcut**: Press <kbd>Spacebar</kbd> anywhere on the page to roll a new quote.
  - **Duplicate Prevention**: Avoids displaying the same quote back-to-back.
  - **Smooth Transitions**: Animated card transitions for seamless content updates.
  - **Clipboard Copying**: One-click **"Copy Quote"** button formats as `"[quote]"\n— [author]` with animated toast alerts.
  - **Quick Author Discovery**: One-click **"More by this author"** button on the hero card instantly scopes the explorer grid to all quotes by that person.

- 🔍 **Real-Time Keyword Search**:
  - 250ms debounced input for fast, lag-free search.
  - Matches across quote text, author names, and category tags simultaneously.
  - **Dynamic Highlighting**: Automatically wraps matching query substrings in `<span class="highlight">`.

- 🏷️ **Multi-Dimensional Category & Author Filtering**:
  - **Interactive Category Chips**: Quickly switch themes with one tap (e.g., *Science & Technology*, *Wisdom & Philosophy*, *Inspiration*).
  - **Dropdown Menus**: Filter by all 9 categories or any of the 72 individual authors, complete with real-time count badges.
  - **Live Counter**: Dynamically displays matching results (e.g., *Showing 12 of 100 quotes*).
  - **One-Click Reset**: Easily restore filters to view all 100 quotes.

- ⚡ **Zero Bloat, Pure Vanilla Tech Stack**:
  - No React, Vue, jQuery, or frontend build pipelines needed.
  - Pure ES6+ native browser JavaScript (`fetch`, `async/await`, `navigator.clipboard`).
  - Modern CSS3 with custom properties, glassmorphism, responsive CSS grid, and mobile-friendly viewports.

---

## 🏛️ Architecture & Project Structure

```
famous-quote/
├── app.py                 # Flask application & REST API routes
├── requirements.txt       # Python dependencies (Flask, pytest)
├── pytest.ini             # Pytest configuration
├── .gitignore             # Git ignore patterns for Python, venv, and OS
├── data/
│   └── quotes.json        # Curated dataset of 100 quotes
├── templates/
│   └── index.html         # Semantic single-page HTML5 template
├── static/
│   ├── css/
│   │   └── style.css      # Modern responsive styling & glassmorphic theme
│   └── js/
│       └── app.js         # Vanilla JavaScript client (state, fetch, DOM)
└── tests/
    └── test_app.py        # Automated test suite (11 test cases)
```

---

## 📊 Dataset Breakdown

The dataset in [`data/quotes.json`](data/quotes.json) consists of **100 quotes** categorized across 9 distinct themes from 72 renowned historical and modern figures:

| Category | Quote Count | Notable Figures |
| :--- | :---: | :--- |
| **Inspiration** | 13 | Eleanor Roosevelt, Walt Disney, Theodore Roosevelt |
| **Success & Ambition** | 13 | Winston Churchill, Henry Ford, Colin Powell |
| **Wisdom & Philosophy** | 12 | Socrates, Confucius, Marcus Aurelius, Lao Tzu |
| **Courage & Resilience** | 12 | Maya Angelou, Nelson Mandela, Helen Keller |
| **Life & Happiness** | 12 | Dalai Lama, Ralph Waldo Emerson, John Lennon |
| **Science & Technology** | 10 | Albert Einstein, Marie Curie, Isaac Newton, Carl Sagan |
| **Humor & Wit** | 10 | Mark Twain, Oscar Wilde, Groucho Marx |
| **Art & Creativity** | 9 | Pablo Picasso, Vincent van Gogh, Leonardo da Vinci |
| **Leadership & Change** | 9 | Mahatma Gandhi, Martin Luther King Jr., John F. Kennedy |

---

## 🔌 REST API Endpoints

The Flask backend provides a clean JSON API consumed by the frontend:

| Method | Endpoint | Query Parameters | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | — | Serves the single-page application interface. |
| `GET` | `/api/health` | — | Returns application health and total quotes count. |
| `GET` | `/api/quotes/random` | `category`, `author`, `exclude_id` | Returns a random quote matching optional criteria. |
| `GET` | `/api/quotes` | `q`, `category`, `author` | Returns filtered quotes with count and total metrics. |
| `GET` | `/api/categories` | — | Returns all 9 categories with exact quote counts. |
| `GET` | `/api/authors` | — | Returns all 72 authors alphabetically with quote counts. |

### Sample JSON Response (`GET /api/quotes/random`):
```json
{
  "status": "success",
  "data": {
    "id": 2,
    "quote": "Imagination is more important than knowledge. For knowledge is limited, whereas imagination embraces the entire world.",
    "author": "Albert Einstein",
    "category": "Science & Technology"
  }
}
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Python 3.10+**
- Git

### 2. Clone Repository
```bash
git clone https://github.com/Aurora-2509/famous-quote.git
cd famous-quote
```

### 3. Create & Activate Virtual Environment
```bash
python3 -m venv .venv

# On macOS/Linux:
source .venv/bin/activate

# On Windows:
.venv\Scripts\activate
```

### 4. Install Dependencies
```bash
pip install -r requirements.txt
```

### 5. Run the Application
```bash
python app.py
```

Open your browser and navigate to:
```
http://127.0.0.1:5001
```
*(Port `5001` is used by default to prevent conflicts with macOS AirPlay Receiver).*

---

## 🧪 Running Automated Tests

The test suite validates data integrity, API contracts, random selection, and query filtering.

```bash
pytest tests/test_app.py -v
```

### Output:
```
tests/test_app.py::test_data_quotes_integrity PASSED                     [  9%]
tests/test_app.py::test_index_route PASSED                               [ 18%]
tests/test_app.py::test_health_endpoint PASSED                           [ 27%]
tests/test_app.py::test_random_quote PASSED                              [ 36%]
tests/test_app.py::test_random_quote_with_filters PASSED                 [ 45%]
tests/test_app.py::test_all_quotes_list PASSED                           [ 54%]
tests/test_app.py::test_quotes_search_query PASSED                       [ 63%]
tests/test_app.py::test_quotes_category_filter PASSED                    [ 72%]
tests/test_app.py::test_quotes_author_filter PASSED                      [ 81%]
tests/test_app.py::test_categories_endpoint PASSED                       [ 90%]
tests/test_app.py::test_authors_endpoint PASSED                          [100%]

============================== 11 passed in 0.12s ==============================
```

---

## 📝 License

This project is licensed under the MIT License — feel free to modify and share!
