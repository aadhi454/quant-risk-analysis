# MONTRO | Quantitative Risk Engine

<div align="center">

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-4-646CFF?logo=vite&logoColor=white)
![Groq](https://img.shields.io/badge/AI-Groq%20%2F%20LLaMA%203.3-F97316)
![Status](https://img.shields.io/badge/Status-Active%20Development-38bdf8)

**An institutional-grade quantitative risk platform powered by Monte Carlo simulation, real-time market data, and an AI analyst assistant.**

</div>

---

## Overview

**MONTRO** (Monte Carlo Risk Optimization) bridges the gap between retail trading and high-level algorithmic risk assessment by replacing emotional bias with probabilistic mathematics. Rather than relying on lagging technical indicators, MONTRO isolates asset drift and volatility, using **Geometric Brownian Motion (GBM)** to simulate thousands of potential market futures and surface actionable, data-driven risk intelligence.

The platform ships with a fully reactive **React + Vite** frontend communicating with a **FastAPI** backend, and an embedded **AI analyst** (MONTRO AI) powered by Groq's LLaMA 3.3 70B model — giving users hedge-fund-calibre analysis on demand.

---

## ✨ Key Features

| Module | Description |
|---|---|
| **Single Asset Simulation** | Run Monte Carlo paths (GBM) for any NSE/BSE ticker. Outputs Expected Return, VaR (95%), CVaR, and Expected Final Price. |
| **Multi-Asset Comparison** | Benchmarks multiple assets under identical constraints and algorithmically identifies the highest risk-adjusted opportunity. |
| **Portfolio Analytics** | Applies Modern Portfolio Theory — covariance matrices, diversification scores, portfolio beta, AUM breakdown. |
| **Live Ticker Tape** | Real-time NIFTY 50, SENSEX, and major NSE equities scrolling across the top of the interface. |
| **Market Status** | Detects NSE market open/closed state in IST with next-open countdown. |
| **MONTRO AI** | Groq-accelerated LLaMA 3.3 70B assistant that reads active simulation/portfolio context and responds with institutional precision. |
| **Historical Price Chart** | Recharts-powered candlestick/line chart for up to 252 days of price history per symbol. |

---

## ⚙️ Technical Architecture

```
┌─────────────────────────────────┐        ┌────────────────────────────────────┐
│         React Frontend          │        │          FastAPI Backend           │
│         (Vite + JSX)            │◄──────►│          (Python 3.10+)            │
│                                 │  JSON  │                                    │
│  Landing → Login → Dashboard    │        │  /api/market/status                │
│  Simulation  Portfolio  Settings│        │  /api/market/ticker                │
│  MontroAI (Groq chatbot)        │        │  /api/stock/history                │
│  TickerTape  Sidebar  Topbar    │        │  /api/simulate/montecarlo          │
└─────────────────────────────────┘        │  /api/portfolio/summary            │
                                           │  /api/ai/insight                   │
                                           │  /api/ai/comparison                │
                                           │  /api/ai/chat  ← Groq / LLaMA 3.3 │
                                           └────────────────────────────────────┘
```

### Stack

**Backend**
- **Runtime:** Python 3.10+
- **API Framework:** FastAPI + Uvicorn (ASGI)
- **Quantitative Core:** NumPy (vectorised GBM), SciPy, Pandas
- **Market Data:** yfinance (real-time & historical NSE/BSE)
- **AI Layer:** Groq SDK → `llama-3.3-70b-versatile`
- **Auth / Config:** python-dotenv

**Frontend**
- **Framework:** React 18 (hooks-based, no Redux)
- **Bundler:** Vite 4
- **Charts:** Recharts
- **Routing:** Custom in-app state machine (Landing → Login → Dashboard shell)
- **Styling:** Vanilla CSS with glassmorphism design system

---

## 📂 Repository Structure

```
quant-risk-analysis/
│
├── api.py                  # FastAPI app — all endpoints & MONTRO AI chat
├── main.py                 # Legacy entry / utilities
├── simulation.py           # GBM Monte Carlo engine
├── portfolio.py            # Covariance matrix & MPT helpers
├── data_loader.py          # yfinance data fetching & cleaning
├── risk_metrics.py         # VaR, CVaR & log-return algorithms
├── visualization.py        # Server-side plot helpers (optional)
├── requirements.txt        # Python dependencies
├── start-backend.sh        # One-shot backend launcher
├── start-frontend.sh       # One-shot frontend launcher
├── .env                    # Environment secrets (not committed)
│
└── montro/                 # React + Vite frontend
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── App.jsx                     # Root router & shell
        ├── main.jsx                    # React DOM entry
        ├── index.css                   # Global design system & tokens
        ├── utils.js                    # Shared helpers
        ├── context/
        │   └── MontroContext.jsx       # Global state (page, simulation data)
        ├── components/
        │   ├── MontroAI.jsx            # Floating AI chat assistant
        │   ├── Sidebar.jsx             # Nav sidebar
        │   ├── Topbar.jsx              # Page header & market status
        │   └── TickerTape.jsx          # Live scrolling price tape
        └── pages/
            ├── Landing.jsx             # 3D/animated entry page
            ├── Login.jsx               # Authentication screen
            ├── Dashboard.jsx           # Portfolio overview & charts
            ├── Simulation.jsx          # Monte Carlo simulation UI
            ├── Portfolio.jsx           # MPT portfolio analytics
            └── Settings.jsx            # System configuration
```

---

## 💻 Local Installation

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm
- A **Groq API key** (free at [console.groq.com](https://console.groq.com))

### 1 — Clone

```bash
git clone https://github.com/aadhi454/quant-risk-analysis.git
cd quant-risk-analysis
```

### 2 — Configure Environment

Create a `.env` file in the project root:

```env
GROQ_API_KEY=your_groq_api_key_here
```

### 3 — Backend Setup

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 4 — Frontend Setup

```bash
cd montro
npm install
```

### 5 — Launch (Dual-Terminal)

**Terminal 1 — Python API (port 8000):**
```bash
source venv/bin/activate
python3 api.py
# or via the helper script:
bash start-backend.sh
```

**Terminal 2 — React Dev Server (port 5173):**
```bash
cd montro
npm run dev
# or via the helper script:
bash start-frontend.sh
```

### 6 — Open

Navigate to **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/market/status` | NSE open/closed state with IST time |
| `GET`  | `/api/market/ticker` | Live prices for NIFTY 50, SENSEX & top 10 equities |
| `GET`  | `/api/stock/history?symbol=&days=` | OHLCV history for any ticker |
| `POST` | `/api/simulate/montecarlo` | Run GBM simulation — returns paths, VaR, CVaR |
| `GET`  | `/api/portfolio/summary` | Portfolio AUM, holdings & health scores |
| `POST` | `/api/ai/insight` | Rule-based narrative for single asset results |
| `POST` | `/api/ai/comparison` | Ranked AI verdict for multi-asset comparison |
| `POST` | `/api/ai/chat` | Context-aware Groq / LLaMA 3.3 chat |

The API is fully documented at **[http://localhost:8000/docs](http://localhost:8000/docs)** (FastAPI Swagger UI) when the backend is running.

---

## 📈 Understanding the Risk Metrics

| Metric | Definition |
|--------|------------|
| **Drift (μ)** | Mean daily log-return — the asset's historical momentum |
| **Volatility (σ)** | Standard deviation of log-returns — a measure of daily unpredictability |
| **Annual Volatility** | `σ × √252` — annualised to match industry convention |
| **VaR (95%)** | *"In 95% of simulated scenarios, the loss will not exceed X%"* |
| **CVaR / Expected Shortfall** | *"In the worst 5% of scenarios, the average loss is X%"* — the true tail-risk measure |
| **Expected Final Price** | Mean of all terminal path prices across the simulation ensemble |

---

## 🤖 MONTRO AI

The embedded AI assistant reads the user's **active page context** (mode, symbol, simulation results, or portfolio holdings) and responds with institutional-grade analysis. It is powered by:

- **Model:** `llama-3.3-70b-versatile` via Groq Cloud
- **Temperature:** 0.4 (precise, low-hallucination)
- **Max Tokens:** 400 per response
- **Context injection:** market status, active symbol, Monte Carlo output, portfolio weights

The system prompt instructs MONTRO AI to behave as a **senior quantitative analyst at a top-tier hedge fund** — always referencing actual simulation numbers, never giving generic advice.

---

## 🗺️ Roadmap

| Phase | Feature | Status |
|-------|---------|--------|
| 1 | GBM Monte Carlo engine + Flask API | ✅ Completed |
| 2 | Algorithmic asset comparison & verdict matrix | ✅ Completed |
| 3 | Full React/Vite frontend migration | ✅ Completed |
| 4 | MONTRO AI (Groq / LLaMA 3.3) chatbot integration | ✅ Completed |
| 5 | Live news sentiment via NLP + GBM drift adjustment | 🔄 In Progress |
| 6 | Live portfolio tracking & dynamic rebalancing alerts | 📋 Planned |
| 7 | Options pricing (Black-Scholes) & Greeks dashboard | 📋 Planned |

---

## 👨‍💻 Author

**Aadhi Keshava Reddy**
- GitHub: [@aadhi454](https://github.com/aadhi454)

---

## 🛡️ License & Disclaimer

**MIT License** — free to use, modify, and distribute with attribution.

> **Disclaimer:** MONTRO is a mathematical simulation tool designed for educational and analytical purposes. Monte Carlo projections model statistical probability, not market certainty. Probabilistic outputs do **not** guarantee future performance. Always conduct independent due diligence before committing capital. The author assumes no liability for financial decisions made using this platform.