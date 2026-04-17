from __future__ import annotations

import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D  # noqa: F401


plt.style.use("ggplot")


def plot_bar_comparison(
    stock_names: list[str],
    returns: list[float],
    volatilities: list[float],
    vars_95: list[float],
) -> None:
    """Create bar charts comparing returns, volatility, and VaR."""
    colors = ["#ff6b6b", "#4ecdc4", "#1a73e8", "#f7b733"]
    dark_colors = ["#264653", "#2a9d8f", "#e76f51", "#8d99ae"]
    risk_colors = ["#22223b", "#4a4e69", "#9a8c98", "#c9ada7"]
    bar_colors = [colors[i % len(colors)] for i in range(len(stock_names))]
    volatility_colors = [dark_colors[i % len(dark_colors)] for i in range(len(stock_names))]
    var_colors = [risk_colors[i % len(risk_colors)] for i in range(len(stock_names))]

    plt.figure(figsize=(8, 5))
    plt.bar(stock_names, returns, color=bar_colors)
    plt.title("Return Comparison", fontsize=14, fontweight="bold")
    plt.xlabel("Stocks")
    plt.ylabel("Return (%)")
    plt.xticks(rotation=30)
    plt.grid(True, axis="y", alpha=0.3)
    plt.tight_layout()
    plt.show()
    plt.close()

    plt.figure(figsize=(8, 5))
    plt.bar(stock_names, volatilities, color=volatility_colors)
    plt.title("Volatility Comparison", fontsize=14, fontweight="bold")
    plt.xlabel("Stocks")
    plt.ylabel("Volatility (%)")
    plt.xticks(rotation=30)
    plt.grid(True, axis="y", alpha=0.3)
    plt.tight_layout()
    plt.show()
    plt.close()

    plt.figure(figsize=(8, 5))
    plt.bar(stock_names, vars_95, color=var_colors)
    plt.title("VaR Comparison", fontsize=14, fontweight="bold")
    plt.xlabel("Stocks")
    plt.ylabel("VaR (%)")
    plt.xticks(rotation=30)
    plt.grid(True, axis="y", alpha=0.3)
    plt.tight_layout()
    plt.show()
    plt.close()


def plot_risk_return_scatter(
    stock_names: list[str],
    returns: list[float],
    volatilities: list[float],
) -> None:
    """Plot risk versus return with labels for each stock."""
    plt.figure(figsize=(7, 5))
    plt.scatter(volatilities, returns, s=120, c="#1a73e8", alpha=0.8, edgecolors="white", linewidths=1)

    for i in range(len(stock_names)):
        plt.text(volatilities[i], returns[i], stock_names[i], fontsize=9, ha="left", va="bottom")

    plt.title("Risk vs Return", fontsize=14, fontweight="bold")
    plt.xlabel("Volatility (%)")
    plt.ylabel("Return (%)")
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.show()
    plt.close()


def plot_portfolio_vs_individual(
    stock_names: list[str],
    returns: list[float],
    portfolio_return: float,
) -> None:
    """Compare portfolio return against individual stock returns."""
    names = stock_names + ["Portfolio"]
    values = returns + [portfolio_return]
    colors = ["#6a11cb"] * len(stock_names) + ["#ffb703"]

    plt.figure(figsize=(8, 5))
    plt.bar(names, values, color=colors)
    plt.title("Portfolio vs Individual Returns", fontsize=14, fontweight="bold")
    plt.xlabel("Assets")
    plt.ylabel("Return (%)")
    plt.xticks(rotation=30)
    plt.grid(True, axis="y", alpha=0.3)
    plt.tight_layout()
    plt.show()
    plt.close()


def plot_3d_risk_return(
    stock_names: list[str],
    returns: list[float],
    volatilities: list[float],
    vars_95: list[float],
) -> None:
    """Plot a 3D risk-return-VaR view."""
    fig = plt.figure(figsize=(8, 6))
    ax = fig.add_subplot(111, projection="3d")

    ax.scatter(volatilities, returns, vars_95, c="#ff6b6b", s=80)

    for i in range(len(stock_names)):
        ax.text(volatilities[i], returns[i], vars_95[i], stock_names[i])

    ax.set_xlabel("Volatility")
    ax.set_ylabel("Return")
    ax.set_zlabel("VaR")
    ax.set_title("3D Risk-Return-VaR View")

    plt.tight_layout()
    plt.show()
    plt.close()
