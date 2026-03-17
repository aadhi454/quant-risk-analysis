import matplotlib.pyplot as plt
import numpy as np

def plot_simulations(simulated_prices):
    plt.figure(figsize=(10,6))
    plt.plot(simulated_prices, alpha=0.1)
    plt.title("Monte Carlo Simulation - Future Price Paths")
    plt.xlabel("Days")
    plt.ylabel("Price")
    plt.show()


def plot_distribution(simulated_prices):
    final_prices = simulated_prices[-1]

    plt.figure(figsize=(10,6))
    plt.hist(final_prices, bins=50)
    plt.title("Final Price Distribution")
    plt.xlabel("Price")
    plt.ylabel("Frequency")
    plt.show()


def plot_with_confidence(simulated_prices):
    mean_path = np.mean(simulated_prices, axis=1)
    percentile_5 = np.percentile(simulated_prices, 5, axis=1)
    percentile_95 = np.percentile(simulated_prices, 95, axis=1)

    plt.figure(figsize=(10,6))

    plt.plot(mean_path, label="Expected Price", linewidth=2)
    plt.fill_between(range(len(mean_path)), percentile_5, percentile_95, alpha=0.3)

    plt.title("Expected Price with Confidence Interval")
    plt.xlabel("Days")
    plt.ylabel("Price")
    plt.legend()

    plt.show()