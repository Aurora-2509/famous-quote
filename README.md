# QuoteVault — 100 Famous & Timeless Quotes

A web application built with **Python Flask** on the backend and **vanilla JavaScript, HTML5, and CSS3** on the frontend. It features a curated dataset of **100 well-known quotes** spanning history, science, philosophy, literature, and technology.

---

## Features

- **Quote of the Moment (Spotlight)**:
  - Generates a random quote on initial page load and on clicking **"New Random Quote"** (or pressing <kbd>Spacebar</kbd>).
  - Smooth card transition animations.
  - One-click **Copy Quote** to clipboard with toast notification.
  - **"More by this author"** shortcut to quickly discover other quotes by the same person.
- **Search & Filtering**:
  - **Real-time Search**: Search across quote text, author names, and themes with highlighted search matches.
  - **Category Filtering**: Filter quotes by topic using interactive category chips or the dropdown menu (e.g., *Science & Technology*, *Wisdom & Philosophy*, *Inspiration*, *Courage & Resilience*, *Humor & Wit*, etc.).
  - **Author Filtering**: Filter quotes by any of the curated authors alphabetically.
  - **Live Counters**: Dynamic indicator showing matching quotes count (e.g. *Showing 12 of 100 quotes*).
- **Clean Vanilla Tech Stack**:
  - No bloated frontend frameworks or external JavaScript libraries.
  - Responsive, modern UI styled with CSS variables, glassmorphism, and responsive grid layout.
- **REST API Endpoints**:
  - `GET /api/quotes/random`: Get a random quote (with optional `?category=`, `?author=`, `?exclude_id=`).
  - `GET /api/quotes`: Search quotes with `?q=`, `?category=`, and `?author=`.
  - `GET /api/categories`: List all categories with quote counts.
  - `GET /api/authors`: List all authors with quote counts.
  - `GET /api/health`: Health status and quote count.

---

## Quick Start

### 1. Activate Environment

```bash
source .venv/bin/activate
```

### 2. Run the Web Application

```bash
python app.py
```

Open your browser and navigate to:
```
http://127.0.0.1:5001
```

---

## Running the Automated Tests

```bash
.venv/bin/pytest tests/test_app.py -v
```
