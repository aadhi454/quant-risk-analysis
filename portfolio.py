from __future__ import annotations

import numpy as np


def calculate_portfolio_return(weights: np.ndarray, returns_list: list[float]) -> float:
    """Calculate the weighted average of individual mean returns."""
    weights_array = np.asarray(weights, dtype=float)
    returns_array = np.asarray(returns_list, dtype=float)

    if weights_array.ndim != 1:
        raise ValueError("Weights must be a one-dimensional array.")
    if returns_array.ndim != 1:
        raise ValueError("Returns list must be one-dimensional.")
    if len(weights_array) != len(returns_array):
        raise ValueError("Weights and returns_list must have the same length.")

    return float(weights_array @ returns_array)


def calculate_portfolio_volatility(weights: np.ndarray, returns_matrix: np.ndarray) -> float:
    """Calculate portfolio volatility from the covariance matrix."""
    weights_array = np.asarray(weights, dtype=float)
    returns_matrix = np.asarray(returns_matrix, dtype=float)

    if weights_array.ndim != 1:
        raise ValueError("Weights must be a one-dimensional array.")
    if returns_matrix.ndim != 2:
        raise ValueError("Returns matrix must be two-dimensional.")
    if returns_matrix.shape[0] != len(weights_array):
        raise ValueError("Weights must match the number of rows in returns_matrix.")

    cov_matrix = np.cov(returns_matrix)
    if np.ndim(cov_matrix) == 0:
        cov_matrix = np.array([[float(cov_matrix)]], dtype=float)
    portfolio_variance = weights_array.T @ cov_matrix @ weights_array
    return float(np.sqrt(portfolio_variance))


def calculate_portfolio_var_es(simulated_portfolio_returns: np.ndarray) -> tuple[float, float]:
    """
    Calculate portfolio VaR and Expected Shortfall at the 95% confidence level.

    Returns values as positive loss fractions.
    """
    portfolio_returns = np.asarray(simulated_portfolio_returns, dtype=float).ravel()
    if portfolio_returns.size == 0:
        raise ValueError("Simulated portfolio returns are empty.")

    losses = np.maximum(0.0, -portfolio_returns)
    var_level = float(np.percentile(losses, 95))
    tail_losses = losses[losses >= var_level]
    expected_shortfall = float(tail_losses.mean()) if tail_losses.size else var_level
    return var_level, expected_shortfall


def monte_carlo_portfolio(simulations_list: list[np.ndarray], weights: np.ndarray) -> np.ndarray:
    """
    Combine individual simulated price paths into a weighted portfolio simulation.

    Each element of simulations_list must have the same shape:
    (days + 1, number_of_simulations).
    """
    weights_array = np.asarray(weights, dtype=float)
    if weights_array.ndim != 1:
        raise ValueError("Weights must be a one-dimensional array.")
    if not simulations_list:
        raise ValueError("Simulations list is empty.")
    if len(simulations_list) != len(weights_array):
        raise ValueError("Weights and simulations_list must have the same length.")

    simulations_array = np.asarray(simulations_list, dtype=float)
    if simulations_array.ndim != 3:
        raise ValueError("Each simulation must be a two-dimensional array.")

    return np.tensordot(weights_array, simulations_array, axes=(0, 0))
