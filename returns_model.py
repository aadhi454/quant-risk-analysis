import numpy as np


def calculate_log_returns(stock):
    """
    Calculate log returns
    """
    log_returns = np.log(stock["Close"] / stock["Close"].shift(1))
    log_returns = log_returns.dropna()
    return log_returns


def calculate_mean(log_returns):
    """
    Calculate mean return
    """
    return log_returns.mean()


def calculate_volatility(log_returns):
    """
    Calculate volatility (standard deviation)
    """
    return log_returns.std()