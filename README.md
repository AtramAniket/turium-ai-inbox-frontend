# Turium AI Knowledge Inbox — Frontend

A small React interface for saving notes and web links, browsing saved knowledge, and asking questions grounded in that knowledge.

## Features

- Save plain-text notes or URLs to the inbox.
- View saved items with their source type and ingestion status.
- Ask a question across saved content.
- Read the generated answer alongside its cited source snippets.
- Clear loading, success, and error feedback for API requests.

## Stack

- React 19
- Vite
- Plain CSS

No router, state-management library, UI component library, or authentication is used.

## Run locally

Install dependencies and start the Vite development server:

```bash
cd frontend
npm install
npm run dev
```

Start the FastAPI backend separately on port 8000. The Vite dev server proxies requests beginning with `/api` to `http://localhost:8000`.

## API integration

The frontend uses these backend endpoints:

| Action | Endpoint | Request |
| --- | --- | --- |
| Save a note or URL | `POST /api/v1/ingest/` | `{ source_type, title?, content? | url? }` |
| Load saved items | `GET /api/v1/items` | — |
| Ask a question | `POST /api/v1/query` | `{ question }` |

Set `VITE_API_URL` to use a different API base URL. Without it, the app uses `/api/v1`.

## Scripts

```bash
npm run dev      # start the development server
npm run build    # create a production build
npm run preview  # preview the production build
npm run lint     # run ESLint
```

## Structure

```text
src/
├── App.jsx       # forms, API calls, items list, answers and citations
├── App.css       # component styles
├── index.css     # global styles
└── main.jsx      # React entry point
```
