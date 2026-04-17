from __future__ import annotations

import pandas as pd
import yfinance as yf


DEFAULT_LOOKBACK_PERIOD = "5y"


def _flatten_columns(frame: pd.DataFrame) -> pd.DataFrame:
    """Normalize yfinance output when it returns multi-index columns."""
    if isinstance(frame.columns, pd.MultiIndex):
        frame = frame.copy()
        frame.columns = [column[0] for column in frame.columns]
    return frame


def get_stock_data(symbol: str, period: str = DEFAULT_LOOKBACK_PERIOD) -> pd.DataFrame:
    """Download historical market data for a single ticker symbol."""
    cleaned_symbol = symbol.strip()
    if not cleaned_symbol:
        raise ValueError("Stock symbol must not be empty.")

    try:
        stock_data = yf.download(
            cleaned_symbol,
            period=period,
            auto_adjust=False,
            progress=False,
            threads=False,
        )
    except Exception as exc:  # pragma: no cover - network/API failure
        raise RuntimeError(f"Failed to fetch data for {cleaned_symbol}.") from exc

    if stock_data is None or stock_data.empty:
        raise ValueError(f"No data found for {cleaned_symbol}.")

    stock_data = _flatten_columns(stock_data)
    if "Adj Close" not in stock_data.columns:
        raise ValueError(f"No adjusted close data found for {cleaned_symbol}.")

    stock_data = stock_data.dropna(subset=["Adj Close"]).copy()
    if stock_data.empty:
        raise ValueError(f"No adjusted close data found for {cleaned_symbol}.")

    return stock_data


def get_adjusted_close_prices(stock_data: pd.DataFrame) -> pd.Series:
    """Extract a clean adjusted close series from the downloaded data."""
    if stock_data is None or stock_data.empty:
        raise ValueError("Stock data is empty.")
    if "Adj Close" not in stock_data.columns:
        raise ValueError("Adjusted close prices are missing.")

    prices = stock_data["Adj Close"].dropna().astype(float)
    if prices.empty:
        raise ValueError("Adjusted close prices are missing.")

    return prices
