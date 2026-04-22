import numpy as np

def run_monte_carlo(current_price, daily_return, daily_volatility, days_to_simulate=252, num_simulations=1000):
    """
    Executes a Geometric Brownian Motion (GBM) Monte Carlo simulation.
    """
    dt = 1 # 1 day step
    
    # Initialize price matrix (Days x Simulations)
    price_matrix = np.zeros((days_to_simulate, num_simulations))
    price_matrix[0] = current_price
    
    # Run the GBM formula for every path simultaneously
    for t in range(1, days_to_simulate):
        random_shock = np.random.normal(0, 1, num_simulations)
        drift = (daily_return - 0.5 * daily_volatility**2) * dt
        shock = daily_volatility * np.sqrt(dt) * random_shock
        price_matrix[t] = price_matrix[t-1] * np.exp(drift + shock)
        
    # Calculate the average expected price at the very end
    expected_final_price = float(np.mean(price_matrix[-1]))
    
    # We only send 50 paths to the frontend so the browser doesn't freeze
    chart_paths = price_matrix[:, :50].T.tolist()
    
    return {
        "expected_final_price": expected_final_price,
        "chart_paths": chart_paths
    }