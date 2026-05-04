# LinkVault

A full-stack web app to save, preview, and organize URLs. Paste any website link, and LinkVault captures a preview thumbnail and stores it under your account.

---

## Tech Stack

| Layer    | Technology           |
|----------|----------------------|
| Frontend | React, Axios         |
| Backend  | FastAPI (Python)     |
| Storage  | Local / DB via FastAPI |

---

## Features

- User login/logout with localStorage session
- Add any URL (auto-prefixes `https://` if missing)
- Live preview thumbnail for each saved link
- Metrics: total links, previews captured, unique domains
- Responsive card grid with hover effects
- Toast notifications for success/error feedback

---

## Project Structure

```
/
├── src/
│   ├── Dashboard.js      # Main dashboard UI & logic
│   ├── App.js            # Root component, handles auth state
│   └── ...
├── backend/
│   └── main.py           # FastAPI server
└── README.md
```

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/Tanushh18/MultiplierAI-Assessment-2.git

```

### 2. Start the backend

```bash
cd backend
pip install fastapi uvicorn
uvicorn main:app --reload
```

Backend runs at `http://127.0.0.1:8000`

### 3. Start the frontend

```bash
npm install
npm start
```

Frontend runs at `http://localhost:3000`

---

## API Endpoints

| Method | Endpoint          | Description                  |
|--------|-------------------|------------------------------|
| GET    | `/links/{user_id}` | Fetch all saved links for user |
| POST   | `/add-link`        | Add a new URL for a user      |

### POST `/add-link` — Query Params

| Param     | Type   | Description        |
|-----------|--------|--------------------|
| `user_id` | string | The logged-in user |
| `url`     | string | Full URL to save   |

---

## Usage

1. Log in with your username
2. Paste a URL into the input field (e.g. `google.com`)
3. Hit **Save Link** or press `Enter`
4. The link appears as a card with a preview image
5. Hit **Logout** (red button, top right) to end your session

---

## Environment Notes

- The frontend expects the backend at `http://127.0.0.1:8000` — update the base URL in `Dashboard.js` if deploying remotely
- Preview images are fetched/generated server-side by the FastAPI backend
- Session is stored in `localStorage` under the key `"user"`

---

## License

MIT