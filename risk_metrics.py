import numpy as np

def calculate_log_returns(stock):
    return np.log(stock["Close"] / stock["Close"].shift(1)).dropna()

def calculate_mean(log_returns):
    return float(log_returns.mean())

def calculate_volatility(log_returns):
    return float(log_returns.std())