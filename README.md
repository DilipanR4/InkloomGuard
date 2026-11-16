# INKLOOM AI — Intelligent Brand Governance Platform

> **Brand Identity:** InkloomGuard  
> **Official Registered Domain:** [https://inkloomguard.xyz](https://inkloomguard.xyz)  
> **Built for:** CodeNexus India 2026 Hackathon (Round 2 Implementation)

---

## 🌟 Executive Summary

**Inkloom AI** is an enterprise-grade, source-grounded brand governance and pre-publication review platform. 

In the modern enterprise, content is produced rapidly across distributed regional teams, agencies, freelancers, and generative AI tools. Brand guidelines often languish in static, unread PDF documents, resulting in inconsistent messaging, unauthorized terminology, and legally risky unverified claims.

Inkloom AI solves this by:
- Ingesting approved guidelines, preferred/prohibited terminology, and verified clinical facts into dynamic vector memory.
- Executing a hybrid evaluation engine (deterministic regex + Gemini LLM claim & tone analysis).
- Explaining every violation with its exact supporting source ID and excerpt.
- Distinguishing **unsupported** from **contradicted** claims.
- Assisting the human decision-maker with intent-preserving corrections without ever overwriting or publishing content automatically.
- Providing role-based approval governance (Creator → Reviewer → Manager) and continuous version auditing.

**Core Principle:** AI assists the decision. Humans retain final authority.

---

## 🛡️ Brand & Domain Configuration

| Attribute | Official Specification |
|---|---|
| **Website Name** | Inkloom AI |
| **Brand Identity** | InkloomGuard |
| **Registered Domain** | `https://inkloomguard.xyz` |
| **Logo Text** | InkloomGuard |
| **Browser Title** | `Inkloom AI \| Intelligent Brand Governance` |
| **Tagline** | Intelligent Brand Governance |

---

## Local Demo Data

Demo data is not created automatically. The optional seed command is destructive and is restricted to a local development database. It requires separate destructive-mode confirmation and three unique, operator-supplied demo passwords. Never use it with production or remote databases.
---

## 🧪 Master Prompt Test Scenario

The optional local seed dataset includes test data matching the hackathon prompt scenario:

**Submitted Copy:**
> *"Fresh+ cures fatigue instantly! India's No. 1 juice is finally here. Buy now!!!"*

**Expected & Delivered Governance Analysis:**
1. `"Fresh+"` → **Brand Terminology Violation** (Contradicted, High Severity). Cites `GUIDE-001` / `TERM-001`. Suggested rewrite: `"FreshPlus"`.
2. `"cures fatigue instantly"` → **Unsupported Claim** (Unsupported, High Severity). Cites `GUIDE-002`. Suggested rewrite: `"supports daily refreshment and natural energy"`. (Labelled unsupported rather than contradicted, preserving evidentiary accuracy).
3. `"India's No. 1"` → **Promotional Claim** (Unsupported, Medium Severity). Cites `GUIDE-003`. Suggested rewrite: `"one of India’s most loved fruit juices"`.
4. `"Buy now!!!"` → **Brand Tone Finding** (Advisory, Advisory Severity). Cites `GUIDE-004`. Suggested rewrite: `"Try FreshPlus today."`.

---

## 🏗️ Technology Stack

- **Frontend:** React.js 18, Vite, Tailwind CSS, React Router v6, Axios, Recharts, Lucide React.
- **Backend:** Node.js, Express.js, MongoDB / Mongoose, JWT authentication, bcryptjs, RBAC middleware.
- **AI Service:** Python 3.13, FastAPI, Pydantic, Scikit-learn (TF-IDF vector retrieval), Google Gemini API (`gemini-1.5-flash`), Pytest.
- **Testing:** Jest + Supertest (Backend), Pytest (AI Microservice).
- **Deployment Ready:** Vercel (Frontend), Railway (Backend & AI Service), MongoDB Atlas (Database). Existing Render services remain backups.

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- Node.js v18+ (tested on Node v26)
- Python 3.10+ (tested on Python 3.13)
- MongoDB running locally or a MongoDB Atlas URI

### 1. Clone & Install Dependencies

```bash
# Clone repository
git clone https://github.com/your-org/inkloomguard.git
cd inkloomguard

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Setup AI service virtual environment
cd ../ai-service
python -m venv venv
.\venv\Scripts\pip install -r requirements.txt   # Windows
# source venv/bin/activate && pip install -r requirements.txt  # macOS/Linux
```

### 2. Configure Environment Variables

Create `.env` files in each service directory (see `.env.example` in each folder):

**Backend (`backend/.env`):**
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/inkloom_dev
JWT_SECRET=replace_with_a_unique_random_secret
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_TOKEN= # Set a long random value; use the same secret in backend and AI service.
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,https://inkloomguard.xyz,https://www.inkloomguard.xyz
FRONTEND_URL=https://inkloomguard.xyz
```

**AI Service (`ai-service/.env`):**
```env
PORT=8000
HOST=0.0.0.0
AI_SERVICE_TOKEN= # Set the same secret as backend; store it only in service environment settings.
AI_ALLOWED_ORIGINS= # Comma-separated exact browser origins; leave empty if browsers do not call AI directly.
# Add your Gemini API Key (optional - system includes deterministic fallback)
GEMINI_API_KEY=""
BRAND_IDENTITY="InkloomGuard"
DOMAIN="https://inkloomguard.xyz"
```

**Frontend (`frontend/.env`):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME="Inkloom AI"
VITE_BRAND_IDENTITY="InkloomGuard"
VITE_DOMAIN="https://inkloomguard.xyz"
```

### 3. Seed Local Development Database

The seed operation deletes and recreates local development data. It refuses production environments, remote MongoDB hosts, and database names other than inkloom_dev.

Set NODE_ENV=development, MONGO_URI=mongodb://127.0.0.1:27017/inkloom_dev, SEED_MODE=destructive, and SEED_CONFIRMATION=I_ACCEPT_DESTRUCTIVE_LOCAL_DEV_SEED. Provide separate unique random passwords of at least 32 characters with SEED_CREATOR_PASSWORD, SEED_REVIEWER_PASSWORD, and SEED_MANAGER_PASSWORD; keep these values in an uncommitted local environment file.

From the repository root, run npm run seed:dev. This command is not part of backend startup or deployment.
### 4. Run the Services

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Server running at http://localhost:5000
```

**Terminal 2 — AI Service:**
```bash
cd ai-service
.\venv\Scripts\uvicorn app.main:app --port 8000 --reload
# Service running at http://localhost:8000
```

**Terminal 3 — Frontend:**
```bash
cd frontend
npm run dev
# Vite dev server running at http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser!

---

## 🧪 Running Automated Tests

### Backend Test Suite (Jest + Supertest):
```bash
cd backend
npm test
```
*Validates API branding, JWT authentication, RBAC authorization, creator approval restriction, and real analytics calculations.*

### AI Service Test Suite (Pytest):
```bash
cd ai-service
.\venv\Scripts\pytest
```
*Validates text preprocessing, PII redaction, deterministic terminology rule matching, vector retrieval, citation anti-hallucination validation, and end-to-end review on the master scenario.*

---

## 🌐 Custom Domain & Production Deployment

### Frontend (Vercel)
1. Use the existing Vercel project with root directory `frontend`.
2. Set `VITE_API_URL=https://inkloomguard-production.up.railway.app/api`.
3. Build with `npm run build` (output directory `dist`). Keep `inkloomguard.xyz` and `www.inkloomguard.xyz` on this project.

### Backend (Railway)
1. Use the existing Railway backend service with root directory `backend/`.
2. Build command: `npm install`. Start command: `npm start`.
3. Configure `NODE_ENV`, `JWT_SECRET`, `MONGO_URI`, `ALLOWED_ORIGINS`, `AI_SERVICE_URL`, and `AI_SERVICE_TOKEN` in the Railway service variables.
4. Set `AI_SERVICE_URL=https://inkloomguard-production-21d2c8e2.up.railway.app`. The backend appends `/v1/review` and `/v1/index`.

### AI Service (Railway)
1. Use the existing Railway AI service with root directory `ai-service/`.
2. Build command: `pip install -r requirements.txt`. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
3. Set `AI_SERVICE_TOKEN` to the same value configured on the backend. `GEMINI_API_KEY` is optional; deterministic fallback remains available. Leave `AI_ALLOWED_ORIGINS` empty when only the backend calls this service.

The existing Render backend and AI services remain backups and are not changed by these instructions.

---

## 📋 Hackathon Round 2 Scope & Roadmap

### Fully Implemented in Round 2:
- ✅ Three-role architecture (Creator, Reviewer, Manager) with enforced backend RBAC.
- ✅ Dynamic Brand Knowledge Library (Guidelines, Terminology, Approved Facts, Assets).
- ✅ Text submission and versioning pipeline (v1, v2, ...).
- ✅ Hybrid AI review engine (Deterministic regex + Gemini LLM).
- ✅ Grounded findings citing exact source IDs and excerpts.
- ✅ Distinction between contradicted, unsupported, and advisory claims.
- ✅ Interactive finding controls: Accept, Edit custom rewrite, Dismiss with required reason.
- ✅ Human-in-the-loop approval workflow (creators strictly forbidden from self-approving).
- ✅ Side-by-side version comparison & diff audit view.
- ✅ Real database analytics visualizations (Recharts).
- ✅ Sensitive data (PII) redaction.
- ✅ Automated tests (Jest + Pytest).
- ✅ Custom domain configuration for `inkloomguard.xyz`.

### Planned Future Phase:
- PDF/DOCX file extraction with formatting preservation.
- Automated visual brand checks (palette hex extraction from images, color contrast WCAG ratios).
- CMS & Social Media webhook integrations.

---

## ⚖️ License & Hackathon Notice

Developed for **CodeNexus India 2026 Hackathon (Round 2)**.  
All demo brand data (FreshPlus) is fictional and created solely for demonstration of brand governance mechanisms.
