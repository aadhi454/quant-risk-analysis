from __future__ import annotations

import numpy as np
import pandas as pd

from data_loader import get_adjusted_close_prices, get_stock_data
from returns_model import calculate_log_returns, calculate_mean_return, calculate_volatility
from risk_metrics import calculate_var_cvar
from simulation import export_simulation_paths, simulate_gbm_paths
from portfolio import (
    calculate_portfolio_return,
    calculate_portfolio_volatility,
    calculate_portfolio_var_es,
    monte_carlo_portfolio,
)
from visualization import (
    plot_3d_risk_return,
    plot_bar_comparison,
    plot_portfolio_vs_individual,
    plot_risk_return_scatter,
)


DEFAULT_SYMBOLS = "RELIANCE.NS"
DEFAULT_DAYS = 252
DEFAULT_SIMULATIONS = 1000
DEFAULT_LOOKBACK_PERIOD = "5y"
CONFIDENCE_LEVEL = 0.95


def prompt_text(prompt: str, default_value: str) -> str:
    """Prompt the user with a default value."""
    try:
        response = input(f"{prompt} [{default_value}]: ").strip()
    except EOFError:
        return default_value
    return response or default_value


def prompt_positive_int(prompt: str, default_value: int) -> int:
    """Prompt the user for a positive integer."""
    while True:
        try:
            response = input(f"{prompt} [{default_value}]: ").strip()
        except EOFError:
            return default_value
        if not response:
            return default_value
        try:
            value = int(response)
            if value <= 0:
                raise ValueError
            return value
        except ValueError:
            print("Please enter a positive whole number.")


def prompt_yes_no(prompt: str, default_value: str = "no") -> bool:
    """Prompt the user for a yes/no answer with a safe default."""
    default_value = default_value.strip().lower()
    while True:
        try:
            response = input(f"{prompt} ({default_value}/yes): ").strip().lower()
        except EOFError:
            response = default_value
        if not response:
            response = default_value
        if response in {"y", "yes"}:
            return True
        if response in {"n", "no"}:
            return False
        print("Please enter 'yes' or 'no'.")


def parse_stock_symbols(raw_symbols: str) -> list[str]:
    """Convert a comma-separated input string into a clean stock list."""
    stocks = [s.strip() for s in raw_symbols.split(",")]
    return [stock for stock in stocks if stock]


def format_percent(value: float) -> str:
    """Format a decimal as a percentage string."""
    return f"{value * 100:.2f}%"


def format_currency(value: float) -> str:
    """Format a numeric value as rupees."""
    return f"₹{value:,.2f}"


def analyze_stock(stock_symbol: str, days: int, simulations: int) -> dict[str, float | str]:
    """Run the complete analysis workflow for a single stock."""
    stock_data = get_stock_data(stock_symbol, period=DEFAULT_LOOKBACK_PERIOD)
    adjusted_close = get_adjusted_close_prices(stock_data)
    log_returns = calculate_log_returns(adjusted_close)
    mean_return = calculate_mean_return(log_returns)
    volatility = calculate_volatility(log_returns)
    current_price = float(adjusted_close.iloc[-1])

    simulated_prices = simulate_gbm_paths(
        last_price=current_price,
        mean_return=mean_return,
        volatility=volatility,
        days=days,
        simulations=simulations,
    )

    final_prices = simulated_prices[-1]
    expected_final_price = float(final_prices.mean())
    expected_return = expected_final_price / current_price - 1.0
    var_95, cvar_95 = calculate_var_cvar(
        final_prices,
        current_price,
        confidence_level=CONFIDENCE_LEVEL,
    )

    return {
        "stock": stock_symbol,
        "current_price": current_price,
        "mean_return": mean_return,
        "volatility": volatility,
        "expected_final_price": expected_final_price,
        "expected_return": expected_return,
        "var_95": var_95,
        "cvar_95": cvar_95,
        "log_returns": log_returns,
        "simulated_prices": simulated_prices,
    }


def print_stock_block(result: dict[str, float | str]) -> None:
    """Print one stock report block."""
    print(f"Stock: {result['stock']}")
    print(f"Mean Return: {format_percent(float(result['mean_return']))}")
    print(f"Volatility: {format_percent(float(result['volatility']))}")
    print(f"Expected Final Price: {format_currency(float(result['expected_final_price']))}")
    print(f"Expected Return: {format_percent(float(result['expected_return']))}")
    print(f"VaR (95%): {format_percent(float(result['var_95']))}")
    print(f"Expected Shortfall: {format_percent(float(result['cvar_95']))}")


def parse_weights(raw_weights: str, expected_count: int) -> np.ndarray:
    """Parse and validate portfolio weights."""
    try:
        weights = np.array([float(value.strip()) for value in raw_weights.split(",")], dtype=float)
    except ValueError as exc:
        raise ValueError("Weights must be numeric values.") from exc

    if len(weights) != expected_count:
        raise ValueError("Number of weights must match the number of analyzed stocks.")
    if np.any(weights < 0):
        raise ValueError("Weights must be non-negative.")
    if not np.isclose(weights.sum(), 1.0, atol=0.01):
        raise ValueError("Weights must sum to approximately 1.")

    return weights


def print_portfolio_report(
    stocks: list[str],
    weights: np.ndarray,
    portfolio_return: float,
    portfolio_volatility: float,
    portfolio_var: float,
    portfolio_es: float,
) -> None:
    """Print the portfolio summary in a clean report format."""
    print()
    print("========================================")
    print("PORTFOLIO ANALYSIS")
    print("========================================")
    print()
    print("Weights:")
    for stock, weight in zip(stocks, weights, strict=True):
        print(f"{stock} → {format_percent(float(weight))}")
    print()
    print(f"Portfolio Return: {format_percent(portfolio_return)}")
    print(f"Portfolio Volatility: {format_percent(portfolio_volatility)}")
    print()
    print(f"Portfolio VaR (95%): {format_percent(portfolio_var)}")
    print(f"Portfolio Expected Shortfall (95%): {format_percent(portfolio_es)}")
    print()
    print("========================================")


def analyze_portfolio(
    results: list[dict[str, float | str]],
    weights: np.ndarray,
) -> tuple[float, float, float, float]:
    """Compute portfolio statistics using aligned returns and simulations."""
    if not results:
        raise ValueError("No analyzed stocks are available for portfolio analysis.")

    stock_symbols = [str(result["stock"]) for result in results]
    mean_returns = [float(result["mean_return"]) for result in results]
    portfolio_return = calculate_portfolio_return(weights, mean_returns)

    return_series = [result["log_returns"].rename(symbol) for result, symbol in zip(results, stock_symbols, strict=True)]
    aligned_returns = pd.concat(return_series, axis=1, join="inner").dropna()
    if aligned_returns.empty:
        raise ValueError("Not enough overlapping return history for portfolio analysis.")

    returns_matrix = aligned_returns.to_numpy().T
    portfolio_volatility = calculate_portfolio_volatility(weights, returns_matrix)

    simulation_paths = [np.asarray(result["simulated_prices"], dtype=float) for result in results]
    portfolio_simulation = monte_carlo_portfolio(simulation_paths, weights)
    initial_portfolio_value = float(portfolio_simulation[0].mean())
    terminal_portfolio_returns = portfolio_simulation[-1] / initial_portfolio_value - 1.0
    portfolio_var, portfolio_es = calculate_portfolio_var_es(terminal_portfolio_returns)

    return portfolio_return, portfolio_volatility, portfolio_var, portfolio_es


def main() -> None:
    """Run the multi-stock risk analysis workflow."""
    raw_symbols = prompt_text(
        "Enter stock symbols separated by commas",
        DEFAULT_SYMBOLS,
    )
    stocks = parse_stock_symbols(raw_symbols)
    days = prompt_positive_int("Enter number of days", DEFAULT_DAYS)
    simulations = prompt_positive_int("Enter number of simulations", DEFAULT_SIMULATIONS)

    if not stocks:
        print("No valid stock symbols provided.")
        return

    results: list[dict[str, float | str]] = []

    print("\n========================================")
    print("MULTI-STOCK RISK ANALYSIS")
    print("========================================")
    print()

    for stock in stocks:
        try:
            result = analyze_stock(stock, days, simulations)
        except (ValueError, RuntimeError):
            print(f"Skipping {stock} (no data found)")
            print()
            print("----------------------------------------")
            print()
            continue

        results.append(result)
        print_stock_block(result)
        print()
        print("----------------------------------------")
        print()

    if not results:
        print("No stocks were successfully analyzed.")
        return

    simulation_export = export_simulation_paths(
        np.asarray(results[0]["simulated_prices"], dtype=float)
    )
    print(f"Exported simulation paths to {simulation_export}")

    stock_names = [str(result["stock"]) for result in results]
    returns_pct = [float(result["expected_return"]) * 100 for result in results]
    volatilities_pct = [float(result["volatility"]) * 100 for result in results]
    vars_pct = [float(result["var_95"]) * 100 for result in results]

    plot_bar_comparison(stock_names, returns_pct, volatilities_pct, vars_pct)
    plot_risk_return_scatter(stock_names, returns_pct, volatilities_pct)
    plot_3d_risk_return(stock_names, returns_pct, volatilities_pct, vars_pct)

    most_risky_stock = max(results, key=lambda item: float(item["volatility"]))
    least_risky_stock = min(results, key=lambda item: float(item["volatility"]))
    best_return_stock = max(results, key=lambda item: float(item["expected_return"]))

    print("========================================")
    print("COMPARISON SUMMARY")
    print("========================================")
    print(f"Most Risky Stock: {most_risky_stock['stock']}")
    print(f"Least Risky Stock: {least_risky_stock['stock']}")
    print(f"Best Return Stock: {best_return_stock['stock']}")
    print()
    print("========================================")

    if prompt_yes_no("Do you want portfolio analysis?", default_value="no"):
        try:
            weights_input = prompt_text(
                "Enter weights (comma separated, same order as analyzed stocks)",
                "",
            )
            weights = parse_weights(weights_input, len(results))
            portfolio_return, portfolio_volatility, portfolio_var, portfolio_es = analyze_portfolio(
                results,
                weights,
            )
            print_portfolio_report(
                stock_names,
                weights,
                portfolio_return,
                portfolio_volatility,
                portfolio_var,
                portfolio_es,
            )
            plot_portfolio_vs_individual(
                stock_names,
                returns_pct,
                portfolio_return * 100,
            )
        except ValueError as exc:
            print(f"Portfolio analysis skipped: {exc}")


if __name__ == "__main__":
    main()
