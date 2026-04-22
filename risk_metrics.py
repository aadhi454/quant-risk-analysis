import numpy as np

def calculate_metrics(returns, confidence_level=0.95):
    """
    Calculates key risk metrics based on historical log returns.
    """
    if not returns or len(returns) == 0:
        return None

    returns_array = np.array(returns)
    
    # 1. Mean and Volatility (Annualized assuming 252 trading days)
    daily_mean = np.mean(returns_array)
    daily_volatility = np.std(returns_array)
    
    annual_return = daily_mean * 252
    annual_volatility = daily_volatility * np.sqrt(252)
    
    # 2. Historical Value at Risk (VaR)
    # For a 95% confidence level, we find the 5th percentile of returns
    alpha = 1.0 - confidence_level
    var = np.percentile(returns_array, alpha * 100)
    
    # 3. Expected Shortfall (CVaR)
    # The average of all returns that are worse than the VaR threshold
    worse_returns = returns_array[returns_array <= var]
    expected_shortfall = np.mean(worse_returns) if len(worse_returns) > 0 else var
    
    return {
        "daily_return": daily_mean,
        "annual_return": annual_return,
        "daily_volatility": daily_volatility,
        "annual_volatility": annual_volatility,
        "var_95": var,  # This will be a negative number representing the loss threshold
        "expected_shortfall_95": expected_shortfall # The average loss beyond VaR
    }