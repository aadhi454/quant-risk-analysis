const API_URL = "http://localhost:5000/api/simulation";
const STATUS_URL = "http://localhost:5000/api/status";

function go(page) {
  window.location.href = page;
}

function logout() {
  localStorage.removeItem("auth");
  window.location.href = "login.html";
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function percentile(values, pct) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = (pct / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  const weight = index - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function renderMetricCards(container, cards) {
  container.innerHTML = cards
    .map(
      (card) => `
        <div class="metric-card">
          <div class="metric-label">${card.label}</div>
          <div class="metric-value">${card.value}</div>
        </div>
      `,
    )
    .join("");
}

async function loadData() {
  const response = await fetch(API_URL, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Unable to load simulation data");
  }
  return response.json();
}

async function loadStatus() {
  const response = await fetch(STATUS_URL, { cache: "no-store" });
  if (!response.ok) {
    return;
  }
  const data = await response.json();
  const chip = document.getElementById("backend-status");
  if (chip) {
    chip.textContent = `Backend: ${data.status}`;
  }
}

function buildDashboard(data) {
  const chartEl = document.getElementById("chart");
  const distEl = document.getElementById("dist");
  const metricsEl = document.getElementById("metrics");
  if (!chartEl || !distEl || !metricsEl) return;

  const path = Array.isArray(data.paths) && data.paths.length > 0 ? data.paths[0] : [];
  if (!path.length) {
    chartEl.innerHTML = "<p>No simulation data available.</p>";
    distEl.innerHTML = "<p>No simulation data available.</p>";
    return;
  }

  const finalPrices = data.paths.map((series) => series[series.length - 1]);
  const currentPrice = path[0];
  const expectedFinalPrice = mean(finalPrices);
  const expectedReturn = ((expectedFinalPrice / currentPrice) - 1) * 100;
  const losses = finalPrices.map((price) => Math.max(0, 1 - price / currentPrice));
  const var95 = percentile(losses, 95) * 100;
  const es95 = mean(losses.filter((loss) => loss >= percentile(losses, 95))) * 100;

  renderMetricCards(metricsEl, [
    { label: "Current Price", value: `₹${formatNumber(currentPrice)}` },
    { label: "Expected Final Price", value: `₹${formatNumber(expectedFinalPrice)}` },
    { label: "Expected Return", value: `${formatNumber(expectedReturn)}%` },
    { label: "VaR (95%)", value: `${formatNumber(var95)}%` },
    { label: "Expected Shortfall", value: `${formatNumber(es95)}%` },
  ]);

  Plotly.newPlot(
    "chart",
    [
      {
        y: path,
        type: "scatter",
        mode: "lines",
        line: { color: "#22c55e", width: 2 },
      },
    ],
    {
      paper_bgcolor: "#111827",
      plot_bgcolor: "#111827",
      font: { color: "#e5e7eb" },
      margin: { l: 40, r: 20, t: 10, b: 40 },
      xaxis: { gridcolor: "#1f2937" },
      yaxis: { gridcolor: "#1f2937" },
    },
    { responsive: true, displaylogo: false },
  );

  Plotly.newPlot(
    "dist",
    [
      {
        x: finalPrices,
        type: "histogram",
        marker: { color: "#3b82f6" },
      },
    ],
    {
      paper_bgcolor: "#111827",
      plot_bgcolor: "#111827",
      font: { color: "#e5e7eb" },
      margin: { l: 40, r: 20, t: 10, b: 40 },
      xaxis: { gridcolor: "#1f2937" },
      yaxis: { gridcolor: "#1f2937" },
    },
    { responsive: true, displaylogo: false },
  );

  let liveValue = path[path.length - 1];
  if (!window.__dashboardTickerStarted) {
    window.__dashboardTickerStarted = true;
    setInterval(() => {
      if (!document.getElementById("chart")) {
        return;
      }
      liveValue += (Math.random() - 0.5) * 0.4;
      Plotly.extendTraces("chart", { y: [[liveValue]] }, [0], 200);
    }, 1500);
  }
}

function buildPortfolio(data) {
  const panel = document.getElementById("portfolio-metrics");
  const calcButton = document.getElementById("portfolio-calc");
  if (!panel || !calcButton) return;

  const paths = Array.isArray(data.paths) ? data.paths.slice(0, 3) : [];
  if (paths.length === 0) {
    panel.innerHTML = "<p>No simulation data available.</p>";
    return;
  }

  const recompute = () => {
    const weights = [
      parseFloat(document.getElementById("w1").value || "0"),
      parseFloat(document.getElementById("w2").value || "0"),
      parseFloat(document.getElementById("w3").value || "0"),
    ];

    const sum = weights.reduce((acc, value) => acc + value, 0);
    if (Math.abs(sum - 1) > 0.01) {
      panel.innerHTML = `<div class="metric-card"><div class="metric-label">Error</div><div class="metric-value">Weights must sum to 1</div></div>`;
      return;
    }

    const length = Math.min(...paths.map((path) => path.length));
    const blended = Array.from({ length }, (_, index) =>
      weights.reduce((acc, weight, pathIndex) => acc + weight * paths[pathIndex][index], 0),
    );

    const start = blended[0];
    const final = blended[blended.length - 1];
    const portfolioReturn = ((final / start) - 1) * 100;
    const scenarioFinals = paths.map((path) => path[path.length - 1]);
    const losses = scenarioFinals.map((price) => Math.max(0, 1 - price / start));
    const var95 = percentile(losses, 95) * 100;
    const es95 = mean(losses.filter((loss) => loss >= percentile(losses, 95))) * 100;

    panel.innerHTML = `
      <div class="metric-grid">
        <div class="metric-card"><div class="metric-label">Weights</div><div class="metric-value">${weights.map((w) => formatNumber(w)).join(" / ")}</div></div>
        <div class="metric-card"><div class="metric-label">Return</div><div class="metric-value">${formatNumber(portfolioReturn)}%</div></div>
        <div class="metric-card"><div class="metric-label">VaR (95%)</div><div class="metric-value">${formatNumber(var95)}%</div></div>
        <div class="metric-card"><div class="metric-label">Expected Shortfall</div><div class="metric-value">${formatNumber(es95)}%</div></div>
      </div>
    `;
  };

  calcButton.addEventListener("click", recompute);
  recompute();
}

async function boot() {
  await loadStatus();

  try {
    const needsData = document.getElementById("chart") || document.getElementById("portfolio-metrics");
    if (!needsData) {
      return;
    }

    const data = await loadData();
    buildDashboard(data);
    buildPortfolio(data);
  } catch (error) {
    const metricsEl = document.getElementById("metrics");
    const chartEl = document.getElementById("chart");
    const distEl = document.getElementById("dist");
    if (metricsEl) {
      metricsEl.innerHTML = `<div class="metric-card"><div class="metric-label">Error</div><div class="metric-value">${error.message}</div></div>`;
    }
    if (chartEl) {
      chartEl.innerHTML = `<p>${error.message}</p>`;
    }
    if (distEl) {
      distEl.innerHTML = `<p>${error.message}</p>`;
    }
  }
}

boot();
