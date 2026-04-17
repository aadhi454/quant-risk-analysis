from __future__ import annotations

import numpy as np
import pandas as pd


def calculate_log_returns(price_series: pd.Series) -> pd.Series:
    """Compute daily log returns using log(Pt / Pt-1)."""
    if price_series is None or price_series.empty:
        raise ValueError("Price series is empty.")

    cleaned_prices = price_series.astype(float).dropna()
    if len(cleaned_prices) < 2:
        raise ValueError("At least two price points are required.")

    log_returns = np.log(cleaned_prices / cleaned_prices.shift(1)).dropna()
    if log_returns.empty:
        raise ValueError("Unable to calculate log returns.")

    return log_returns


def calculate_mean_return(log_returns: pd.Series) -> float:
    """Return the arithmetic mean of log returns."""
    if log_returns is None or log_returns.empty:
        raise ValueError("Log returns are empty.")
    return float(log_returns.mean())


def calculate_volatility(log_returns: pd.Series) -> float:
    """Return the sample standard deviation of log returns."""
    if log_returns is None or log_returns.empty:
        raise ValueError("Log returns are empty.")

    volatility = float(log_returns.std(ddof=1))
    if np.isnan(volatility):
        raise ValueError("Volatility could not be calculated.")

    return volatility
