import yfinance as yf
import pandas as pd
import numpy as np

def fetch_stock_data(ticker, period="1y"):
    """
    Fetches historical stock data from Yahoo Finance and calculates daily log returns.
    """
    try:
        # yfinance expects Indian stocks with a .NS or .BO suffix (e.g., RELIANCE.NS)
        stock = yf.Ticker(ticker)
        hist = stock.history(period=period)
        
        if hist.empty:
            return None
            
        # Calculate daily logarithmic returns for the GBM model
        hist['Log_Return'] = np.log(hist['Close'] / hist['Close'].shift(1))
        hist = hist.dropna()
        
        return {
            'prices': hist['Close'].tolist(),
            'dates': hist.index.strftime('%Y-%m-%d').tolist(),
            'returns': hist['Log_Return'].tolist(),
            'current_price': hist['Close'].iloc[-1]
        }
        
    except Exception as e:
        print(f"Error fetching data for {ticker}: {e}")
        return None