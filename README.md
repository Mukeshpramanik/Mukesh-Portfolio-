# 🚀 Mukesh Pramanik – Premium Digital Portfolio

A **premium, futuristic, interactive** personal digital portfolio built for **Mukesh Pramanik** (B.Tech Computer Science Engineering student, 2023–2027).

Designed to stand out from ordinary developer portfolios with an editorial dark theme (violet `#8B5CF6` and cyan `#22D3EE` accents), smooth Framer Motion micro-interactions, an interactive command terminal, a 100% browser-based **Ask Mukesh AI** assistant, and a local-only administration dashboard.

![Hosting](https://img.shields.io/badge/Hosting-GitHub_Pages-22D3EE?style=for-the-badge&logo=github)
![Cost](https://img.shields.io/badge/Total_Budget-₹0_Free_Forever-10B981?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14_Static_Export-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss)
![Backend](https://img.shields.io/badge/Backend-FastAPI_Optional_Local-009688?style=for-the-badge&logo=fastapi)

---

## 🎯 Zero-Budget (₹0) Engineering Architecture

This portfolio operates on a **strict ₹0 budget**:
- **Hosting**: Free GitHub Pages with an automated GitHub Actions deployment workflow.
- **URL**: Free GitHub Pages domain (`https://mukeshpramanik.github.io/Mukesh-Portfolio` or `https://mukeshpramanik.github.io/`).
- **AI Assistant**: **Ask Mukesh AI** runs 100% in the client browser with an internal knowledge base — zero external paid APIs, zero subscriptions, zero tokens billed.
- **Admin Management**: Local-only, protected by client-side SHA-256 cryptographic hashing. Passphrases and secrets are never committed or exposed in code.
- **Data Persistence**: Offline-first architecture with structured seed data and browser `localStorage` synchronization for contact submissions and analytics.

---

## ✨ Features

### Public Portfolio
- 🎬 **Cinematic Hero** – Dynamic canvas particle network, rotating typewriter headline, and gradient accents.
- 🤖 **Ask Mukesh AI** – Floating interactive conversational assistant answering questions about skills, projects, and internship availability with zero API cost.
- 👤 **About Me** – Academic biography, quick stat counters, and specialized domain tags.
- 📊 **Skills Dashboard** – Filter tabs (Programming, Data Analysis, Web Development, Tools) and viewport-triggered animated proficiency bars.
- 🛠️ **Projects Showcase** – 5 verified portfolio projects with GitHub repositories, category filters, and detailed markdown case study pages.
- 🎓 **Education & Career Timeline** – B.Tech Computer Science Engineering (2023–2027) academic roadmap.
- 📜 **Certifications & Achievements** – Credential showcase ready for verified badges.
- 💬 **Testimonials Carousel** – Auto-playing carousel with hover pause and dot pagination.
- 📝 **Technical Blog** – Articles on Data Analytics in Python and Clean CRUD Application architecture with code syntax highlighting.
- 📧 **Contact & Local Inbox** – Validated contact form storing inquiries in local inbox with instant email client fallback.
- 🖥️ **Interactive Terminal** – Linux-style emulator supporting commands (`help`, `about`, `skills`, `projects`, `education`, `contact`, `social`, `resume`, `theme`, `clear`, `matrix`).
- 🎨 **Theme Switcher** – High-contrast Dark mode and refined Light mode with persistent state.
- ⌨️ **Command Palette (Cmd/Ctrl + K)** – Universal modal navigation for keyboard-first power users.
- 📱 **Mobile Responsive** – Fluid layout across mobile, tablet, and desktop viewports.
- ♿ **Accessible** – Semantic HTML5 elements, ARIA labels, and keyboard navigation.

### Local Admin Dashboard (`/admin`)
- 🛡️ **Secure Access** – Authenticates via local FastAPI backend or initializes a private SHA-256 hashed passphrase in the browser.
- 📊 **Overview Stats** – Counts for projects, skills, contact messages, and site traffic.
- ✏️ **Full Content Management** – Interactive CRUD modals for Projects, Skills, Education, Experience, Certifications, Achievements, Blog Posts, and Testimonials.
- 📩 **Contact Inquiries Inbox** – Review, read, and manage contact submissions saved locally.

---

## 🛠️ GitHub Pages Deployment (Automatic via GitHub Actions)

The repository includes a ready-to-run GitHub Actions workflow at [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

### Step 1: Push Code to GitHub
```bash
git init
git add .
git commit -m "feat: Mukesh Pramanik portfolio with GitHub Pages deployment"
git branch -M main
git remote add origin https://github.com/Mukeshpramanik/Mukesh-Portfolio.git
git push -u origin main
```

### Step 2: Enable GitHub Pages in Repository Settings
1. Navigate to your repository on GitHub: `https://github.com/Mukeshpramanik/Mukesh-Portfolio`
2. Click **Settings** (tab at top).
3. In the left sidebar, click **Pages**.
4. Under **Build and deployment** > **Source**, select **GitHub Actions**.

### Step 3: Automatic Deployment
- Every push to the `main` branch triggers the GitHub Actions workflow automatically.
- The workflow:
  1. Installs Node.js dependencies (`npm ci`).
  2. Dynamically detects whether your repo is a user page (`username.github.io`) or a project page (`username.github.io/repo-name`) and sets the `basePath` accordingly.
  3. Executes `npm run build` to generate the production static export into `frontend/out/`.
  4. Places a `.nojekyll` file to bypass Jekyll processing.
  5. Deploys the artifact to GitHub Pages.
- Your portfolio is immediately live at:  
  **`https://mukeshpramanik.github.io/Mukesh-Portfolio/`**

---

## ⚠️ GitHub Pages Limitations & Architectural Solutions

GitHub Pages is a static file hosting service. Here is how this project elegantly addresses each technical limitation while keeping your budget at ₹0:

| Limitation | Impact | Solution Implemented |
|---|---|---|
| **No server-side runtime (Node.js / Python)** | Next.js Server Components, API routes, and FastAPI cannot run directly on GitHub Pages | Configured Next.js static HTML export (`output: 'export'`) with `dynamic = 'force-static'` and `trailingSlash: true`. All pages are pre-rendered at build time. |
| **No hosted database (PostgreSQL)** | Cannot query a remote relational database directly from static GitHub Pages | Complete fallback data is embedded in [`profile.ts`](frontend/src/data/profile.ts). If you run the FastAPI backend locally, it seamlessly hydrates data via `/api`. When on GitHub Pages, the site runs 100% standalone. |
| **Serverless contact forms** | No backend endpoint to receive POST requests on static hosting | Form entries are saved to the browser's `localStorage` (`mukesh_portfolio_inbox`) so you can inspect all messages inside the local Admin Inbox, accompanied by an instant mailto trigger. |
| **Subpath asset routing** | Hosting under `/<repo-name>` breaks root-relative URLs (`/_next/...`) | [`next.config.mjs`](frontend/next.config.mjs) supports `basePath` and `assetPrefix` injected dynamically by GitHub Actions workflow during build. |
| **No external AI API budget** | OpenAI, Claude, or Gemini APIs require paid API keys and billing | Built **Ask Mukesh AI** with a client-side keyword and pattern-matching knowledge base running 100% in JavaScript in the browser. Zero latency, zero cost. |

---

## 💻 Local Development

### Running the Frontend
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Verifying the Production Static Build
```bash
cd frontend
npm run build
```
The static export will be generated in `frontend/out/`.

### (Optional) Running the Local FastAPI Backend
If you want to use PostgreSQL and the Python backend locally:
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```
API Documentation will be live at [http://localhost:8000/docs](http://localhost:8000/docs).

---

## 🔒 Security Architecture
- **Zero Plaintext Secrets**: No passwords, tokens, or credentials are hardcoded into the source code.
- **Client-Side SHA-256**: The local admin login hashes passphrases using standard `crypto.subtle.digest('SHA-256')`.
- **Environment Isolation**: Production secrets and database URLs are isolated inside `.env` (gitignored).

---

## 👤 Author

**Mukesh Pramanik**  
B.Tech in Computer Science Engineering (Batch 2023–2027)  
- GitHub: [@Mukeshpramanik](https://github.com/Mukeshpramanik)
- Interests: Data Analytics, Python, AI/ML, Software Development

---

<p align="center">
  Crafted with precision • Hosted on GitHub Pages • 100% Free & Open Source
</p>
