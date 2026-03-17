import numpy as np

def monte_carlo_simulation(last_price, mean_return, volatility, days=252, simulations=2000):

    # Ensure everything is pure float (VERY IMPORTANT)
    mean_return = float(mean_return)
    volatility = float(volatility)
    last_price = float(last_price)

    simulated_prices = np.zeros((days, simulations))

    for sim in range(simulations):

        prices = np.zeros(days)
        prices[0] = last_price

        for day in range(1, days):

            # Generate random shock (scalar only)
            shock = np.random.normal(mean_return, volatility)

            # GBM formula
            prices[day] = prices[day - 1] * np.exp(shock)

        simulated_prices[:, sim] = prices

    return simulated_prices