# MONTRA | Quantitative Risk Engine

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Python](https://img.shields.io/badge/Python-3.10%2B-green.svg)
![Three.js](https://img.shields.io/badge/Three.js-WebGL-black.svg)
![Status](https://img.shields.io/badge/Status-Active_Development-38bdf8.svg)

**MONTRA (Monte Carlo Trading & Risk Analysis)** is a high-performance, institutional-grade quantitative risk platform. It bridges the gap between retail trading and high-level algorithmic risk assessment by eliminating emotional bias and replacing it with probabilistic mathematics. 

Rather than relying on lagging technical indicators, MONTRA isolates asset drift and volatility, utilizing Geometric Brownian Motion (GBM) to simulate thousands of potential market futures. The result is actionable, mathematically sound risk-to-reward intelligence.

---

## 🚀 Execution & Core Capabilities

The platform is divided into three primary analytical modules:

* **Single Asset Targeting:** Executes rapid Monte Carlo pathways (e.g., 5,000 paths over 252 trading days) to calculate Expected Return, 95% Value at Risk (VaR), and Expected Shortfall (CVaR).
* **Multi-Asset Matrix (Apples-to-Apples):** Benchmarks multiple assets against identical capital, time, and simulation constraints. An algorithmic verdict automatically identifies the mathematically optimal asset based on the risk-adjusted return ratio.
* **Ecosystem Portfolio Engine:** Applies Modern Portfolio Theory (MPT) principles. By processing covariance matrices across user-defined asset weights, the engine reveals the exact diversification benefit and combined ecosystem volatility.

---

## ⚙️ Technical Architecture

The system architecture is explicitly optimized for efficiency. The mathematical matrix generation is highly vectorized, and the cinematic frontend offloads rendering to the GPU. This ensures that heavy probabilistic calculations and 3D data visualizations run flawlessly even in hardware-constrained environments (e.g., standard 8GB memory limits).

### The Stack
* **Backend Pipeline:** Python, Flask, Flask-CORS
* **Quantitative Engine:** NumPy (Vectorized Matrix Math), SciPy, Pandas
* **Data Ingestion:** `yfinance` (Real-time & Historical Market Data)
* **Frontend UI/UX:** HTML5, CSS3 (Glassmorphism & Institutional Typography)
* **3D Environment:** Three.js (Lightweight WebGL Particle Geometries)
* **Data Visualization:** Plotly.js (`scattergl` GPU-accelerated rendering)

---

## 📂 Repository Structure & Branching

```text
montra-risk-engine/
│
├── main                     # Production-ready release branch
├── dev                      # Active development and feature integration branch
│
├── backend.py               # Flask API routing and endpoint architecture
├── simulation.py            # Core Geometric Brownian Motion (GBM) engine
├── portfolio.py             # Covariance matrix and MPT calculations
├── data_loader.py           # yfinance API data fetching and cleaning
├── risk_metrics.py          # VaR, CVaR, and logarithmic return algorithms
├── requirements.txt         # Python dependencies
│
└── frontend/                # Client-side architecture
    ├── index.html           # 3D Landing Page / Gateway
    ├── login.html           # Authentication Module
    ├── dashboard.html       # Platform Overview & Quant Methodology Brief
    ├── simulation.html      # Single & Multi-Asset Monte Carlo UI
    ├── portfolio.html       # MPT Allocation & Ecosystem UI
    └── settings.html        # System Configuration & Environment Status

    ## 💻 Local Installation & Boot Sequence

The following instructions are optimized for a standard Linux terminal environment.

**1. Clone the Repository**
```bash
git clone https://github.com/aadhi454/quant-risk-analysis.git
cd quant-risk-analysis
```

**2. Initialize the Virtual Environment**
Isolating dependencies ensures the math engine runs without version conflicts.
```bash
python3 -m venv venv
source venv/bin/activate
```

**3. Install Core Dependencies**
```bash
pip install -r requirements.txt
```

**4. Ignite the Architecture (Dual-Terminal Setup)**
Because MONTRA separates the frontend client from the heavy Python backend, you must run two local servers simultaneously.

*Terminal 1 (The Engine):*
```bash
source venv/bin/activate
python3 backend.py
```

*Terminal 2 (The Interface):*
```bash
cd frontend
python3 -m http.server 8000
```

**5. Access the Terminal**
Open your preferred web browser (hardware acceleration enabled) and navigate to `http://localhost:8000/index.html`.

---

## 📈 Understanding the Metrics

MONTRA distills millions of simulated data points into actionable institutional metrics:

* **Drift & Shock:** The structural DNA of the asset's trajectory. Drift is the historical momentum; Shock is the unpredictable volatility.
* **Value at Risk (VaR 95%):** The statistical safety net. "What is the maximum expected loss in 95% of normal market conditions?"
* **Expected Shortfall (CVaR):** The tail-risk assessment. "If the market breaches the 95% VaR threshold, exactly how severe will the remaining 5% worst-case scenarios be?"

---

## 🗺️ Future Roadmap

* **Phase 1:** Complete baseline UI/UX overhaul to WebGL environments. *(Completed)*
* **Phase 2:** Integrate algorithmic verdict matrices for automated asset comparison. *(Completed)*
* **Phase 3:** Hardware expansion. Transitioning to local AI/LLM integration (e.g., OpenJarvis framework) to process live news sentiment against the GBM drift calculations. 
* **Phase 4:** Live portfolio tracking and dynamic rebalancing alerts.

---

## 👨‍💻 Author

**Aadhi Keshava Reddy**
* **GitHub:** [@aadhi454](https://github.com/aadhi454)

---

## 🛡️ License & Disclaimer

**MIT License**

*Disclaimer: MONTRA is a mathematical simulation tool designed for educational and analytical purposes. Probabilistic Monte Carlo projections do not guarantee future market performance. Always conduct independent due diligence before committing capital.*