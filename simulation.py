from __future__ import annotations

import json
from pathlib import Path

import numpy as np


def simulate_gbm_paths(
    last_price: float,
    mean_return: float,
    volatility: float,
    days: int,
    simulations: int,
    random_seed: int | None = None,
) -> np.ndarray:
    """
    Simulate future prices with Geometric Brownian Motion.

    The mean return and volatility are assumed to be daily estimates, so the
    time step is one trading day.
    """
    if last_price <= 0:
        raise ValueError("Last price must be greater than zero.")
    if days <= 0:
        raise ValueError("Number of days must be greater than zero.")
    if simulations <= 0:
        raise ValueError("Number of simulations must be greater than zero.")
    if volatility < 0:
        raise ValueError("Volatility cannot be negative.")

    if random_seed is not None:
        np.random.seed(random_seed)

    time_step = 1.0
    drift = (mean_return - 0.5 * volatility**2) * time_step
    diffusion = volatility * np.sqrt(time_step)

    shocks = np.random.normal(size=(days, simulations))
    log_returns = drift + diffusion * shocks
    future_paths = last_price * np.exp(np.cumsum(log_returns, axis=0))

    return np.vstack([np.full(simulations, last_price), future_paths])


def export_simulation_paths(
    simulated_prices: np.ndarray,
    output_path: str | Path = "simulation.json",
) -> Path:
    """Export simulation paths in a frontend-friendly JSON format.

    The exported structure is:
    {
      "paths": [[...], [...], ...]
    }
    where each inner array is one simulated price path over time.
    """
    if simulated_prices is None or simulated_prices.size == 0:
        raise ValueError("Simulated prices are empty.")

    output_file = Path(output_path)
    output_file.parent.mkdir(parents=True, exist_ok=True)

    payload = {"paths": simulated_prices.T.tolist()}
    output_file.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    return output_file
