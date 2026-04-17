📊 Quant Risk Intelligence Platform

A full-stack financial analytics system for simulating stock price movements and analyzing risk using quantitative finance models.

---

🚀 Overview

This project implements a Monte Carlo simulation engine to model stock price behavior and evaluate financial risk metrics. It integrates a Python-based backend with an interactive web dashboard to deliver insights into portfolio performance.

The system is designed to demonstrate real-world quantitative finance concepts such as stochastic modeling, volatility estimation, and risk assessment.

---

🧠 Key Features

📈 Simulation Engine

- Log returns computation
- Volatility estimation
- Geometric Brownian Motion (GBM)
- Monte Carlo simulation (multi-path forecasting)

📊 Risk Analytics

- Value at Risk (VaR)
- Expected Shortfall (ES)
- Portfolio return and volatility

🌐 Web Application

- Flask backend API
- Interactive dashboard with charts
- Multi-page UI (Dashboard, Portfolio, Settings)
- Real-time simulation visualization

---

🏗️ Project Structure

quant-risk-analysis/
│
├── backend.py
├── main.py
├── simulation.json
├── requirements.txt
│
├── returns_model.py
├── risk_metrics.py
├── simulation.py
├── portfolio.py
│
└── frontend/
    ├── landing.html
    ├── login.html
    ├── dashboard.html
    ├── portfolio.html
    ├── settings.html
    ├── styles.css
    └── app.js

---

⚙️ Installation & Setup

1. Clone Repository

git clone https://github.com/your-username/quant-risk-analysis.git
cd quant-risk-analysis

---

2. Create Virtual Environment

python3 -m venv venv
source venv/bin/activate

---

3. Install Dependencies

pip install -r requirements.txt

---

4. Generate Simulation Data

python main.py

---

5. Start Backend Server

python backend.py

---

6. Open Application

Go to:

http://127.0.0.1:5000

---

🔐 Demo Credentials

Email: admin@quant.com
Password: 1234

---

📊 System Workflow

1. Historical stock data is processed
2. Log returns and volatility are calculated
3. Monte Carlo simulation generates price paths
4. Risk metrics (VaR, Expected Shortfall) are computed
5. Backend serves data via API
6. Frontend visualizes results dynamically

---

🛠️ Technologies Used

- Python (NumPy, Pandas)
- Flask
- JavaScript
- Plotly.js
- HTML/CSS

---

⚠️ Disclaimer

This project is intended for educational purposes only and does not provide financial advice.

---

🔮 Future Enhancements

- Real-time stock data integration
- Advanced trading charts (candlestick)
- Portfolio optimization models
- AI-based risk prediction
- Authentication system with database

---

👨‍💻 Author

Developed as part of a Quantitative Finance & AI project.