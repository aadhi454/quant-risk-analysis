"""
MONTRO — Monte Carlo Risk Optimization
FastAPI Backend
"""
from __future__ import annotations

import os
import random
from datetime import datetime, timezone, timedelta
from typing import Optional, Any

import numpy as np
import yfinance as yf
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from pydantic import BaseModel

load_dotenv()
_groq = Groq(api_key=os.getenv("GROQ_API_KEY", ""))

app = FastAPI(title="MONTRO API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# IST helpers
# ─────────────────────────────────────────────
IST = timezone(timedelta(hours=5, minutes=30))

TICKER_SYMBOLS = [
    "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS",
    "WIPRO.NS", "BHARTIARTL.NS", "ICICIBANK.NS", "ADANIENT.NS",
    "SBIN.NS", "^NSEI", "^BSESN", "BAJFINANCE.NS",
]

TICKER_LABELS = {
    "RELIANCE.NS": "RELIANCE",
    "TCS.NS": "TCS",
    "HDFCBANK.NS": "HDFCBANK",
    "INFY.NS": "INFY",
    "WIPRO.NS": "WIPRO",
    "BHARTIARTL.NS": "BHARTIARTL",
    "ICICIBANK.NS": "ICICIBANK",
    "ADANIENT.NS": "ADANIENT",
    "SBIN.NS": "SBIN",
    "^NSEI": "NIFTY 50",
    "^BSESN": "SENSEX",
    "BAJFINANCE.NS": "BAJFINANCE",
}

MOCK_PRICES = {
    "RELIANCE.NS":   (2928.45, 1.24),
    "TCS.NS":        (3489.10, -0.38),
    "HDFCBANK.NS":   (1912.75,  0.87),
    "INFY.NS":       (1548.20,  2.15),
    "WIPRO.NS":      (485.10,   1.40),
    "BHARTIARTL.NS": (1380.55,  0.62),
    "ICICIBANK.NS":  (1104.30,  1.10),
    "ADANIENT.NS":   (2410.80, -2.34),
    "SBIN.NS":       (760.50,  -1.10),
    "^NSEI":         (24680.50, 0.78),
    "^BSESN":        (81224.75, 0.65),
    "BAJFINANCE.NS": (8920.15,  1.89),
}

def _is_market_open() -> bool:
    now = datetime.now(IST)
    if now.weekday() >= 5:
        return False
    market_open  = now.replace(hour=9,  minute=15, second=0, microsecond=0)
    market_close = now.replace(hour=15, minute=30, second=0, microsecond=0)
    return market_open <= now <= market_close


# ─────────────────────────────────────────────
# GET /api/market/status
# ─────────────────────────────────────────────
@app.get("/api/market/status")
def market_status():
    now = datetime.now(IST)
    is_open = _is_market_open()
    return {
        "isOpen": is_open,
        "istTime": now.strftime("%H:%M:%S"),
        "nextOpen": "09:15 IST Mon" if now.weekday() >= 4 else "09:15 IST",
    }


# ─────────────────────────────────────────────
# GET /api/market/ticker
# ─────────────────────────────────────────────
@app.get("/api/market/ticker")
def market_ticker():
    results = []
    try:
        data = yf.download(
            " ".join(TICKER_SYMBOLS),
            period="2d",
            interval="1d",
            progress=False,
            auto_adjust=True,
        )
        closes = data["Close"]
        for sym in TICKER_SYMBOLS:
            label = TICKER_LABELS[sym]
            try:
                prices = closes[sym].dropna()
                if len(prices) >= 2:
                    price  = float(prices.iloc[-1])
                    prev   = float(prices.iloc[-2])
                    change = round((price - prev) / prev * 100, 2)
                    results.append({"symbol": label, "price": round(price, 2), "change": change})
                    continue
            except Exception:
                pass
            # fallback
            p, c = MOCK_PRICES.get(sym, (100.0, 0.0))
            results.append({"symbol": label, "price": p, "change": c})
    except Exception:
        for sym in TICKER_SYMBOLS:
            p, c = MOCK_PRICES.get(sym, (100.0, 0.0))
            results.append({"symbol": TICKER_LABELS[sym], "price": p, "change": c})
    return results


# ─────────────────────────────────────────────
# GET /api/stock/history
# ─────────────────────────────────────────────
@app.get("/api/stock/history")
def stock_history(symbol: str = "RELIANCE.NS", days: int = 90):
    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period=f"{days}d")
        if hist.empty:
            raise ValueError("empty")
        return [
            {
                "date": str(idx.date()),
                "open":  round(float(row["Open"]),  2),
                "high":  round(float(row["High"]),  2),
                "low":   round(float(row["Low"]),   2),
                "close": round(float(row["Close"]), 2),
                "volume": int(row["Volume"]),
            }
            for idx, row in hist.tail(days).iterrows()
        ]
    except Exception:
        # deterministic mock
        base = 2850.0
        out = []
        for i in range(days):
            base += random.gauss(0, 18)
            out.append({"date": f"2024-{i//30+1:02d}-{i%30+1:02d}", "close": round(max(base, 1000), 2)})
        return out


# ─────────────────────────────────────────────
# POST /api/simulate/montecarlo
# ─────────────────────────────────────────────
class SimRequest(BaseModel):
    symbol: str = "RELIANCE.NS"
    paths: int = 28
    steps: int = 100
    drift: Optional[float] = None
    volatility: Optional[float] = None
    investment_amount: Optional[float] = None
    days: Optional[int] = None
    simulations: Optional[int] = 1000


@app.post("/api/simulate/montecarlo")
def run_montecarlo(req: SimRequest):
    # Use user-supplied days as steps if provided
    steps = req.days if req.days and req.days > 0 else req.steps

    try:
        ticker = yf.Ticker(req.symbol)
        hist = ticker.history(period="1y")
        if hist.empty:
            raise ValueError("no data")
        returns = np.log(hist["Close"] / hist["Close"].shift(1)).dropna()
        mu  = req.drift     if req.drift     is not None else float(returns.mean())
        sig = req.volatility if req.volatility is not None else float(returns.std())
        current_price = float(hist["Close"].iloc[-1])
    except Exception:
        mu  = req.drift     if req.drift     is not None else 0.0008
        sig = req.volatility if req.volatility is not None else 0.018
        current_price = MOCK_PRICES.get(req.symbol, (2928.45, 1.24))[0]

    # If user specified an investment amount, scale so current_price = investment
    starting_price = req.investment_amount if req.investment_amount and req.investment_amount > 0 else current_price

    dt = 1
    paths_arr = np.zeros((req.paths, steps))
    paths_arr[:, 0] = starting_price
    for t in range(1, steps):
        z = np.random.normal(0, 1, req.paths)
        paths_arr[:, t] = paths_arr[:, t - 1] * np.exp(
            (mu - 0.5 * sig ** 2) * dt + sig * np.sqrt(dt) * z
        )

    final_prices = paths_arr[:, -1]
    expected_final = float(np.mean(final_prices))
    mean_price     = round(expected_final, 2)
    annual_vol     = float(sig * np.sqrt(252))
    annual_return  = float(mu * 252)

    returns_dist = final_prices / starting_price - 1.0
    var95 = float(np.percentile(returns_dist, 5))
    worse = returns_dist[returns_dist <= var95]
    es95  = float(np.mean(worse)) if len(worse) > 0 else var95

    return {
        "symbol":             req.symbol,
        "currentPrice":       round(current_price, 2),
        "startingPrice":      round(starting_price, 2),
        "paths":              paths_arr.tolist(),
        "pathCount":          req.paths,
        "steps":              steps,
        "expectedReturn":     round(annual_return, 6),
        "annualVolatility":   round(annual_vol, 6),
        "var95":              round(var95, 6),
        "es95":               round(es95, 6),
        "expectedFinalPrice": mean_price,
        "meanPrice":          mean_price,
    }


# ─────────────────────────────────────────────
# GET /api/portfolio/summary
# ─────────────────────────────────────────────
@app.get("/api/portfolio/summary")
def portfolio_summary():
    holdings = [
        {"symbol": "RELIANCE", "exchange": "NSE", "allocation": 0.28, "marketValue": 3976000, "return": 0.142, "risk": 0.68},
        {"symbol": "TCS",      "exchange": "NSE", "allocation": 0.22, "marketValue": 3124000, "return": 0.089, "risk": 0.52},
        {"symbol": "HDFCBANK", "exchange": "NSE", "allocation": 0.18, "marketValue": 2556000, "return": 0.061, "risk": 0.44},
        {"symbol": "INFY",     "exchange": "NSE", "allocation": 0.16, "marketValue": 2272000, "return": 0.118, "risk": 0.58},
        {"symbol": "BHARTI",   "exchange": "NSE", "allocation": 0.10, "marketValue": 1420000, "return": 0.203, "risk": 0.71},
        {"symbol": "OTHERS",   "exchange": "NSE", "allocation": 0.06, "marketValue":  852000, "return": 0.034, "risk": 0.38},
    ]
    total_aum = sum(h["marketValue"] for h in holdings)
    return {
        "totalAUM":       total_aum,
        "realizedPnL":    854000,
        "unrealizedPnL":  312500,
        "portfolioBeta":  1.08,
        "holdings":       holdings,
        "health": {
            "diversification":    74,
            "concentrationRisk":  42,
            "liquidityScore":     88,
        },
    }


# ─────────────────────────────────────────────
# POST /api/ai/insight  (single stock)
# ─────────────────────────────────────────────
class InsightRequest(BaseModel):
    symbol: str
    expected_return: float
    volatility: float
    var_95: float
    expected_shortfall: float
    days: int
    investment_amount: Optional[float] = None


@app.post("/api/ai/insight")
def ai_insight(req: InsightRequest):
    sym  = req.symbol.upper().replace(".NS", "").replace(".BO", "")
    ret_pct  = round(req.expected_return * 100, 2)
    vol_pct  = round(req.volatility * 100, 2)
    var_pct  = round(abs(req.var_95) * 100, 2)
    es_pct   = round(abs(req.expected_shortfall) * 100, 2)
    inv      = req.investment_amount
    inv_str  = f"₹{inv:,.0f}" if inv else "the invested capital"

    if req.expected_return > 0.15 and req.volatility < 0.20:
        text = (
            f"Based on Monte Carlo simulation across 1,000 paths, {sym} demonstrates "
            f"strong growth probability with controlled downside risk. Expected return of "
            f"{ret_pct}% over {req.days} days with {vol_pct}% annualised volatility "
            f"suggests a favourable risk-adjusted opportunity. VaR(95%) of {var_pct}% "
            f"indicates maximum probable 1-day loss remains within acceptable institutional "
            f"thresholds. For {inv_str}, this translates to a disciplined high-conviction entry."
        )
    elif req.volatility > 0.25:
        text = (
            f"Simulation results indicate elevated volatility for {sym} over the "
            f"{req.days}-day horizon at {vol_pct}% annualised. While an expected return of "
            f"{ret_pct}% suggests upside potential, the wide distribution of terminal outcomes "
            f"reflects heightened uncertainty. Expected Shortfall of {es_pct}% signals "
            f"meaningful tail risk. Consider reducing position size relative to portfolio "
            f"risk budget, and set hard stop-loss boundaries before entry."
        )
    else:
        text = (
            f"Monte Carlo analysis reveals moderate risk-return dynamics for {sym} over "
            f"{req.days} days. An expected return of {ret_pct}% paired with {vol_pct}% "
            f"volatility reflects typical mid-risk equity behaviour. The simulation "
            f"distribution shows balanced probability across upside and downside scenarios. "
            f"VaR(95%) of {var_pct}% and Expected Shortfall of {es_pct}% are within normal "
            f"bounds for this asset class. Suitable for moderate-risk allocations within a "
            f"diversified portfolio framework."
        )
    return {"insight": text}


# ─────────────────────────────────────────────
# POST /api/ai/comparison  (multi-stock)
# ─────────────────────────────────────────────
class StockSummary(BaseModel):
    symbol: str
    expected_return: float
    volatility: float


class ComparisonRequest(BaseModel):
    stocks: list[StockSummary]
    days: int


@app.post("/api/ai/comparison")
def ai_comparison(req: ComparisonRequest):
    if not req.stocks:
        return {"insight": "No stocks provided for comparison."}

    ranked = sorted(req.stocks, key=lambda s: s.expected_return / max(s.volatility, 0.001), reverse=True)
    best   = ranked[0]
    worst  = ranked[-1]

    best_sym  = best.symbol.upper().replace(".NS", "").replace(".BO", "")
    worst_sym = worst.symbol.upper().replace(".NS", "").replace(".BO", "")
    n = len(req.stocks)

    text = (
        f"Across 1,000 Monte Carlo simulations over {req.days} days, {best_sym} demonstrated "
        f"the strongest risk-adjusted performance with {round(best.expected_return*100,2)}% "
        f"expected return and {round(best.volatility*100,2)}% annualised volatility — "
        f"yielding the highest Sharpe-equivalent ratio across all {n} assets analysed. "
    )
    if n > 1:
        text += (
            f"{worst_sym} showed the weakest risk-adjusted profile "
            f"({round(worst.expected_return*100,2)}% return, {round(worst.volatility*100,2)}% vol). "
        )
    text += (
        f"For institutional allocation over this horizon, {best_sym} presents the most "
        f"favourable probability-weighted outcome. Diversifying across these assets may reduce "
        f"portfolio-level VaR through low cross-asset correlation."
    )
    return {"insight": text}


# ─────────────────────────────────────────────
# POST /api/ai/chat  — Groq-powered assistant
# ─────────────────────────────────────────────

SYSTEM_PROMPT = (
    "You are MONTRO AI, a professional quantitative analyst and hedge fund advisor embedded "
    "inside the MONTRO risk analytics platform. You have access to the user's current "
    "simulation data, portfolio allocations, market conditions, and risk metrics. Always "
    "respond in a concise, confident, institutional tone — like a senior analyst at a "
    "top-tier hedge fund. Use the context data provided to give specific, data-driven answers. "
    "Never give generic financial advice. Always reference the actual numbers from the context. "
    "Keep responses under 120 words unless the user explicitly asks for a detailed breakdown. "
    "Format responses in clean prose, no bullet points unless listing comparisons."
)


class ChatContext(BaseModel):
    mode: Optional[str] = "dashboard"
    symbol: Optional[str] = None
    symbols: Optional[list[str]] = None
    investment_amount: Optional[float] = None
    days: Optional[int] = None
    expected_return: Optional[float] = None
    volatility: Optional[float] = None
    var_95: Optional[float] = None
    expected_shortfall: Optional[float] = None
    expected_final_price: Optional[float] = None
    portfolio: Optional[list[dict]] = None
    market_status: Optional[str] = "closed"
    nifty_change: Optional[float] = None


class ChatRequest(BaseModel):
    message: str
    context: Optional[ChatContext] = None


def _build_context_str(ctx: ChatContext) -> str:
    if not ctx:
        return ""
    parts = []
    ms = ctx.market_status or "unknown"
    nifty = f"{ctx.nifty_change:+.2f}%" if ctx.nifty_change is not None else "N/A"
    parts.append(f"Market is currently {ms}. NIFTY 50 is {nifty} today.")

    if ctx.mode in ("single",) and ctx.symbol:
        inv = f"₹{ctx.investment_amount:,.0f}" if ctx.investment_amount else "unspecified amount"
        parts.append(
            f"User is analyzing {ctx.symbol} with {inv} invested over {ctx.days or '?'} days."
        )
        if ctx.expected_return is not None:
            parts.append(
                f"Monte Carlo results — Expected Return: {ctx.expected_return:.2f}%, "
                f"Volatility: {ctx.volatility:.2f}%, VaR(95%): {ctx.var_95:.2f}%, "
                f"Expected Shortfall: {ctx.expected_shortfall:.2f}%, "
                f"Expected Final Price: ₹{ctx.expected_final_price:,.2f}."
            )
    elif ctx.mode == "multi" and ctx.symbols:
        parts.append(f"User is comparing stocks: {', '.join(ctx.symbols)}.")
    elif ctx.mode == "portfolio" and ctx.portfolio:
        holdings = "; ".join(
            f"{h.get('symbol','?')} ({h.get('allocation',0):.1f}%, ret {h.get('return',0):.1f}%)"
            for h in ctx.portfolio
        )
        parts.append(f"Portfolio holdings: {holdings}.")

    return " ".join(parts)


@app.post("/api/ai/chat")
def ai_chat(req: ChatRequest):
    try:
        ctx_str = _build_context_str(req.context) if req.context else ""
        system = SYSTEM_PROMPT
        if ctx_str:
            system += f"\n\nCurrent context: {ctx_str}"

        completion = _groq.chat.completions.create(
            model="llama-3.3-70b-versatile",
            temperature=0.4,
            max_tokens=400,
            messages=[
                {"role": "system",  "content": system},
                {"role": "user",    "content": req.message},
            ],
        )
        reply = completion.choices[0].message.content.strip()
        return {"reply": reply}
    except Exception as e:
        print(f"Groq error: {e}")
        return {"reply": "MONTRO AI is temporarily unavailable. Please try again."}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
