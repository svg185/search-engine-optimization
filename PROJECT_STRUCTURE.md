# Search Engine Project Structure

This project is structured as a search engine with a local machine-learning ranking layer and an optional API-key based answer layer.

## Main User Files

- `index.html` - User search interface.
- `style.css` - Complete UI styling for search page and admin dashboard.
- `script.js` - Main search flow, answer rendering, online platform links, and result display.
- `database.js` - IndexedDB/localStorage database helper for custom knowledge records.

## API And Machine Learning Files

- `ml-search.js` - Machine-learning style ranking module. It tokenizes the query, builds text vectors, calculates cosine similarity, and ranks records.
- `api-client.js` - API client layer. It reads API settings, checks if an API key is configured, and can call an OpenAI-compatible chat completions endpoint.
- `config.example.js` - Example configuration file for API endpoint, model, and API key.

## Admin Files

- `admin.html` - Admin login page.
- `admin.js` - Admin login logic.
- `admin-dashboard.html` - Admin dashboard for data, users, history, database records, and API/ML settings.
- `admin-dashboard.js` - Admin dashboard logic.

## How The Search Works

1. User enters a query in `index.html`.
2. `script.js` sends the query to `ml-search.js`.
3. `ml-search.js` ranks local knowledge records using tokenization and cosine similarity.
4. `script.js` shows Google-style online platform links.
5. If API settings are enabled in admin, `api-client.js` can call the configured API endpoint with the query and top local matches.
6. If the API is not configured or fails, the project uses the local ML-ranked knowledge base as fallback.

## API Key Setup

1. Open `admin.html` and login.
2. Go to `API / ML Settings`.
3. Add endpoint, model, API key, and enable API answers.
4. Search from the home page.

For a static frontend demo, the API key is stored in browser `localStorage`. For production, API keys should be kept on a backend server, not inside frontend code.
