from data_loader import get_stock_data
from risk_metrics import calculate_log_returns, calculate_mean, calculate_volatility
from simulation import monte_carlo_simulation
from visualization import plot_simulations, plot_distribution, plot_with_confidence

import matplotlib.pyplot as plt

# -----------------------------
# Step 1: User Input
# -----------------------------
ticker = "RELIANCE.NS"

# -----------------------------
# Step 2: Load Stock Data
# -----------------------------
stock = get_stock_data(ticker)

# Fix multi-index issue (important)
try:
    stock.columns = stock.columns.droplevel(1)
except:
    pass

# -----------------------------
# Step 3: Calculate Log Returns
# -----------------------------
log_returns = calculate_log_returns(stock)

# -----------------------------
# Step 4: Calculate Metrics
# -----------------------------
mean_return = calculate_mean(log_returns)
volatility = calculate_volatility(log_returns)

print("Mean Return:", mean_return)
print("Volatility:", volatility)

# -----------------------------
# Step 5: Get Last Price
# -----------------------------
last_price = float(stock["Close"].iloc[-1])

# -----------------------------
# Step 6: Run Monte Carlo Simulation
# -----------------------------
simulated_prices = monte_carlo_simulation(
    last_price,
    mean_return,
    volatility,
    days=252,
    simulations=2000
)

# -----------------------------
# Step 7: Visualization
# -----------------------------
plot_simulations(simulated_prices)
plot_distribution(simulated_prices)
plot_with_confidence(simulated_prices)