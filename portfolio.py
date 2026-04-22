import numpy as np
import pandas as pd
import yfinance as yf

def calculate_portfolio_metrics(tickers, weights, confidence_level=0.95):
    """
    Calculates expected return, volatility, VaR, and expected shortfall 
    for a weighted portfolio of stocks using historical covariance.
    """
    if len(tickers) != len(weights):
        return {"error": "Number of tickers and weights must match."}
        
    if not np.isclose(sum(weights), 1.0):
        return {"error": "Portfolio weights must sum to 1.0."}
        
    weights = np.array(weights)
    
    # Fetch historical data and calculate daily log returns for all tickers
    returns_dict = {}
    for ticker in tickers:
        try:
            stock = yf.Ticker(ticker)
            hist = stock.history(period="1y")
            if not hist.empty:
                hist['Log_Return'] = np.log(hist['Close'] / hist['Close'].shift(1))
                returns_dict[ticker] = hist['Log_Return'].dropna()
        except Exception as e:
            print(f"Error fetching {ticker}: {e}")
            return {"error": f"Failed to fetch data for {ticker}"}
            
    # Combine into a single DataFrame to align dates perfectly
    portfolio_df = pd.DataFrame(returns_dict).dropna()
    
    if portfolio_df.empty:
        return {"error": "No overlapping historical data found for the portfolio."}
        
    # Calculate mean daily returns and the covariance matrix
    mean_daily_returns = portfolio_df.mean()
    cov_matrix = portfolio_df.cov()
    
    # Calculate portfolio daily return and variance (matrix multiplication)
    portfolio_daily_return = np.dot(weights, mean_daily_returns)
    portfolio_daily_variance = np.dot(weights.T, np.dot(cov_matrix, weights))
    portfolio_daily_volatility = np.sqrt(portfolio_daily_variance)
    
    # Annualize the return and volatility
    portfolio_annual_return = portfolio_daily_return * 252
    portfolio_annual_volatility = portfolio_daily_volatility * np.sqrt(252)
    
    # Calculate historical daily portfolio returns for VaR/CVaR
    portfolio_historical_returns = portfolio_df.dot(weights)
    
    # Calculate VaR and Expected Shortfall
    alpha = 1.0 - confidence_level
    var = np.percentile(portfolio_historical_returns, alpha * 100)
    
    worse_returns = portfolio_historical_returns[portfolio_historical_returns <= var]
    expected_shortfall = np.mean(worse_returns) if len(worse_returns) > 0 else var
    
    return {
        "status": "Valid",
        "portfolio_return": portfolio_annual_return,
        "portfolio_volatility": portfolio_annual_volatility,
        "portfolio_var_95": var,
        "portfolio_cvar_95": expected_shortfall
    }