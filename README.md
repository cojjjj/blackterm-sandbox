# BLACKTERM // SANDBOX

> Interactive malware behavior replay platform for security researchers, students, and blue teams.

![Status](https://img.shields.io/badge/status-active-success)
![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20Vite-8A2BE2)
![Backend](https://img.shields.io/badge/backend-FastAPI-009688)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## Overview

BLACKTERM Sandbox is a modern malware behavior replay platform designed to visualize synthetic malware execution in a safe environment.

Unlike traditional sandboxes that only display logs, BLACKTERM Sandbox recreates an interactive analyst experience with:

- Malware replay engine
- Process visualization
- Windows VM replay
- MITRE ATT&CK mapping
- IOC extraction
- DLL inspection
- Network visualization
- Timeline analysis
- Interactive forensic dashboards

All telemetry is synthetic and intended for education, demonstrations, and security research.

---

# Features

### Malware Replay Engine

- Event-by-event playback
- Pause / Resume
- Replay speed controls
- Timeline scrubbing
- Replay snapshots

### Interactive Analysis

- Process Tree
- Windows VM Replay
- Registry Viewer
- Memory Viewer
- DLL Inspector
- Network Visualization
- ATT&CK Matrix

### Threat Intelligence

- IOC Extraction
- MITRE ATT&CK Mapping
- Risk Scoring
- Threat Timeline
- Analyst Notes

---

# Tech Stack

## Frontend

- React
- Vite
- JavaScript
- CSS

## Backend

- Python
- FastAPI
- SQLite

---

# Project Structure

```text
blackterm-sandbox/

├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── app/
│   ├── data/
│   ├── requirements.txt
│   └── main.py
│
└── .gitignore
```

---

# Getting Started

## Backend

```bash
cd backend

python -m venv .venv

.\.venv\Scripts\activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

Backend runs on

```
http://localhost:8000
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

Frontend runs on

```
http://localhost:5173
```

---

# Roadmap

## Frontend

- [x] Timeline Viewer
- [x] Process Tree
- [x] Windows VM Replay
- [x] DLL Inspector
- [ ] Network Visualization
- [ ] Memory Heatmap
- [ ] MITRE Matrix Improvements
- [ ] AI Analyst Panel

---

## Backend

- [ ] Replay Engine Refactor
- [ ] SQLite Database
- [ ] Replay REST API
- [ ] IOC Extraction Engine
- [ ] MITRE Mapping Engine
- [ ] Report Generator
- [ ] Import Engine

---

# Development Team

## Frontend

**Tyler Deppa**

GitHub:
https://github.com/cojjjj

Responsibilities

- UI/UX
- Replay Engine
- React Components
- Dashboard Design
- Visualizations
- Frontend Architecture

---

## Backend

**coj-beep**

GitHub:
https://github.com/coj-beep

Responsibilities

- FastAPI
- Database
- Replay Engine API
- IOC Processing
- MITRE Mapping
- Backend Architecture

---

# Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a Pull Request
5. Request a review before merging

---

# Screenshots

(Add screenshots here as development continues.)

---

# License

MIT License

---

## BLACKTERM Security Research

Built for defenders.

Designed for analysts.

Powered by curiosity.
