from __future__ import annotations

import numpy as np


def calculate_var_cvar(
    final_prices: np.ndarray,
    current_price: float,
    confidence_level: float = 0.95,
) -> tuple[float, float]:
    """
    Calculate VaR and Expected Shortfall using terminal losses.

    The result is returned as a fraction of current price, so 0.05 means 5%.
    """
    if final_prices is None or len(final_prices) == 0:
        raise ValueError("Final prices are empty.")
    if current_price <= 0:
        raise ValueError("Current price must be greater than zero.")
    if not 0 < confidence_level < 1:
        raise ValueError("Confidence level must be between 0 and 1.")

    terminal_returns = final_prices / current_price - 1.0
    losses = np.maximum(0.0, -terminal_returns)

    var_level = np.percentile(losses, confidence_level * 100)
    tail_losses = losses[losses >= var_level]
    cvar_level = float(tail_losses.mean()) if tail_losses.size else float(var_level)

    return float(var_level), float(cvar_level)
