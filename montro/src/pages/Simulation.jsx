import { useState, useMemo, useEffect, useRef } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { pathColor, fmtPct } from '../utils'
import { useMontro } from '../context/MontroContext'

const FIXED_PATHS  = 28
const SLOT_COLORS  = ['var(--cyan)', 'var(--blue)', 'var(--violet)', 'var(--green)']
const SLOT_HEX     = ['#00f2ff', '#1a6bff', '#9b30ff', '#00ffaa']

// ── Shared helpers ─────────────────────────────────────────────────────────────

function MetricCard({ label, value, color, loading }) {
  if (loading) return <div className="skeleton skeleton-card" />
  return (
    <div className="glass-card" style={{ padding: 16 }}>
      <div className="caps-label" style={{ marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, color, textShadow: `0 0 8px ${color}55` }}>
        {value}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="glass-card" style={{
      minHeight: 320, display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexDirection: 'column', gap: 12,
    }}>
      <span style={{ fontSize: 28, opacity: 0.2 }}>⟳</span>
      <span style={{
        fontFamily: 'var(--font-body)', fontStyle: 'italic',
        color: 'var(--text)', opacity: 0.45, fontSize: 14,
        textAlign: 'center', maxWidth: 420,
      }}>
        Enter parameters above and run simulation to generate analysis
      </span>
    </div>
  )
}

// ── Typewriter AI insight card ─────────────────────────────────────────────────

function AIInsightCard({ text }) {
  const [typed, setTyped] = useState('')
  const textRef = useRef(text)

  useEffect(() => {
    textRef.current = text
    setTyped('')
    let i = 0
    const iv = setInterval(() => {
      if (i < text.length) {
        setTyped(text.slice(0, ++i))
      } else {
        clearInterval(iv)
      }
    }, 22)
    return () => clearInterval(iv)
  }, [text])

  return (
    <div className="glass-card" style={{ borderLeft: '3px solid rgba(0,242,255,0.4)', marginTop: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: 'var(--cyan)' }}>◈</span>
          <span className="caps-label" style={{ letterSpacing: 2 }}>AI INVESTMENT INSIGHT</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="dot-live" />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text)' }}>MONTRO NEURAL</span>
        </div>
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.8, color: 'var(--text-bright)', fontFamily: 'var(--font-body)' }}>
        {typed}
        <span className="cursor">▌</span>
      </div>
    </div>
  )
}

// ── Single stock chart tooltip ─────────────────────────────────────────────────

function SingleTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <div style={{ color: 'var(--text-mid)', fontSize: 10, marginBottom: 3 }}>Day {label}</div>
      <div style={{ color: 'var(--cyan)' }}>₹{Number(payload[0]?.value ?? 0).toFixed(2)}</div>
    </div>
  )
}

// ── Comparison multi-stock tooltip ─────────────────────────────────────────────

function CompTooltip({ active, payload, label, symbols }) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <div style={{ color: 'var(--text-mid)', fontSize: 10, marginBottom: 6 }}>Day {label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.stroke, fontSize: 12, marginBottom: 2 }}>
          {p.dataKey.replace('pct_', '')}: {Number(p.value).toFixed(2)}%
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB A — SINGLE STOCK ANALYSIS
// ─────────────────────────────────────────────────────────────────────────────

function SingleStockTab() {
  const { setSimResult } = useMontro()
  const [ticker, setTicker]       = useState('')
  const [investment, setInvestment] = useState('')
  const [days, setDays]           = useState('')
  const [running, setRunning]     = useState(false)
  const [result, setResult]       = useState(null)
  const [error, setError]         = useState(null)
  const [insight, setInsight]     = useState(null)

  const runSim = async () => {
    if (running) return
    setError(null)
    setResult(null)
    setInsight(null)
    setRunning(true)
    const sym = ticker.trim() || 'RELIANCE.NS'
    const numDays = days ? parseInt(days, 10) : 100
    const inv = investment ? parseFloat(investment) : null

    try {
      const res = await fetch('/api/simulate/montecarlo', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: sym, paths: FIXED_PATHS, days: numDays, investment_amount: inv, simulations: 1000 }),
      })
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      const data = await res.json()
      setResult(data)
      setSimResult(data)   // write to shared context for chatbot

      // Fetch AI insight
      try {
        const ir = await fetch('/api/ai/insight', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            symbol: sym,
            expected_return: data.expectedReturn,
            volatility: data.annualVolatility,
            var_95: data.var95,
            expected_shortfall: data.es95,
            days: numDays,
            investment_amount: inv,
          }),
        })
        if (ir.ok) setInsight((await ir.json()).insight)
      } catch { /* skip */ }

    } catch (e) {
      setError(e.message)
    } finally {
      setRunning(false)
    }
  }

  const chartData = useMemo(() => {
    if (!result?.paths) return []
    return Array.from({ length: result.steps }, (_, t) => {
      const row = { day: t }
      result.paths.forEach((p, pi) => { row[`p${pi}`] = p[t] })
      return row
    })
  }, [result])

  const histData = useMemo(() => {
    if (!result?.paths) return []
    const finals = result.paths.map(p => p[p.length - 1])
    const min = Math.min(...finals), max = Math.max(...finals)
    const buckets = 30, sz = (max - min) / buckets
    const counts = new Array(buckets).fill(0)
    finals.forEach(v => { counts[Math.min(Math.floor((v - min) / sz), buckets - 1)]++ })
    const maxC = Math.max(...counts)
    return counts.map((c, i) => ({ height: maxC ? c / maxC : 0, idx: i }))
  }, [result])

  const hasResult = !!result

  return (
    <>
      {/* Input panel */}
      <div className="glass-card mb-24">
        <div className="sim-inputs-grid">
          <div className="sim-field">
            <label htmlFor="s-ticker">Stock Ticker Symbol</label>
            <input id="s-ticker" className="sim-input" type="text"
              placeholder="e.g. RELIANCE.NS" value={ticker}
              onChange={e => setTicker(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && runSim()} />
          </div>
          <div className="sim-field">
            <label htmlFor="s-inv">Investment Amount (₹)</label>
            <input id="s-inv" className="sim-input" type="number" min={1000}
              placeholder="e.g. 100000" value={investment}
              onChange={e => setInvestment(e.target.value)} />
          </div>
          <div className="sim-field">
            <label htmlFor="s-days">Simulation Period (Days)</label>
            <input id="s-days" className="sim-input" type="number" min={1} max={365}
              placeholder="e.g. 30" value={days}
              onChange={e => setDays(e.target.value)} />
          </div>
          <button className="btn-primary" onClick={runSim} disabled={running}
            style={{ whiteSpace: 'nowrap', height: 44, alignSelf: 'flex-end' }}>
            {running ? '⟳ RUNNING...' : '▶ RUN SIMULATION'}
          </button>
        </div>
        {error && <div style={{ marginTop: 10, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--red)' }}>⚠ {error}</div>}
      </div>

      {/* Metric cards */}
      <div className="grid-5 mb-24">
        <MetricCard loading={running} label="EXPECTED RETURN"    color="var(--green)"  value={hasResult ? fmtPct(result.expectedReturn)    : '—'} />
        <MetricCard loading={running} label="ANNUAL VOLATILITY"  color="var(--amber)"  value={hasResult ? fmtPct(result.annualVolatility)  : '—'} />
        <MetricCard loading={running} label="VALUE AT RISK 95%"  color="var(--red)"    value={hasResult ? fmtPct(result.var95)             : '—'} />
        <MetricCard loading={running} label="EXPECTED SHORTFALL" color="var(--violet)" value={hasResult ? fmtPct(result.es95)              : '—'} />
        <MetricCard loading={running} label="EXPECTED PRICE"     color="var(--cyan)"   value={hasResult ? `₹${result.expectedFinalPrice}`  : '—'} />
      </div>

      {/* Chart or states */}
      {running ? <div className="skeleton skeleton-chart" />
        : hasResult ? (
          <>
            <div className="glass-card scanline-host mb-20" style={{ display: 'flex', flexDirection: 'column', minHeight: 420 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-brand)', fontSize: 13, color: 'var(--cyan)', letterSpacing: 1.5 }}>
                    MONTE CARLO PROJECTION MATRIX
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-mid)', marginTop: 4 }}>
                    μ: ₹{result.meanPrice} &nbsp;|&nbsp; VaR₅: {fmtPct(result.var95)} &nbsp;|&nbsp; {result.symbol}
                  </div>
                </div>
                <div className="caps-label">{result.pathCount} PATHS / {result.steps} DAYS</div>
              </div>

              <div style={{ flex: 1, minHeight: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis dataKey="day" tick={{ fill: 'var(--text)', fontSize: 10 }}
                      label={{ value: 'Trading Days →', position: 'insideBottom', fill: 'var(--text)', fontSize: 10, dy: 8 }} />
                    <YAxis tickFormatter={v => `₹${v.toFixed(0)}`} tick={{ fill: 'var(--text)', fontSize: 10 }} width={78} />
                    <Tooltip content={<SingleTooltip />} />
                    <ReferenceLine y={result.startingPrice ?? result.currentPrice}
                      stroke="var(--cyan)" strokeDasharray="4 4" opacity={0.5} />
                    {result.paths.map((_, pi) => (
                      <Line key={pi} type="monotone" dataKey={`p${pi}`}
                        stroke={pathColor(pi, result.pathCount)} strokeWidth={1}
                        dot={false} opacity={0.28} isAnimationActive={false} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Histogram */}
              <div style={{ marginTop: 20 }}>
                <div className="caps-label" style={{ marginBottom: 8 }}>
                  FINAL PRICE DISTRIBUTION — {result.steps} DAY HORIZON
                </div>
                <div className="hist-bars">
                  {histData.map((b, i) => (
                    <div key={i} className="hist-bar" style={{
                      height: `${Math.max(b.height * 100, 3)}%`,
                      background: pathColor(b.idx, histData.length), opacity: 0.8,
                    }} />
                  ))}
                </div>
              </div>
            </div>

            {/* AI Insight */}
            {insight && <AIInsightCard text={insight} />}
          </>
        ) : <EmptyState />}
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB B — MULTI-STOCK COMPARISON
// ─────────────────────────────────────────────────────────────────────────────

function MultiStockTab() {
  const { setMultiResults } = useMontro()
  const [investment, setInvestment] = useState('')
  const [days, setDays]             = useState('')
  const [tickers, setTickers]       = useState(['', '', '', ''])
  const [showExtra, setShowExtra]   = useState(false)
  const [running, setRunning]       = useState(false)
  const [results, setResults]       = useState(null)
  const [error, setError]           = useState(null)
  const [insight, setInsight]       = useState(null)

  const setTicker = (i, v) => setTickers(prev => prev.map((t, idx) => idx === i ? v : t))

  const runComparison = async () => {
    if (running) return
    const activeTickers = tickers.slice(0, showExtra ? 4 : 2).filter(t => t.trim())
    if (!activeTickers.length) { setError('Enter at least one ticker symbol.'); return }
    setError(null); setResults(null); setInsight(null); setRunning(true)
    const numDays = days ? parseInt(days, 10) : 100
    const inv = investment ? parseFloat(investment) : null

    try {
      const responses = await Promise.all(activeTickers.map(sym =>
        fetch('/api/simulate/montecarlo', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbol: sym.trim(), paths: FIXED_PATHS, days: numDays, investment_amount: inv, simulations: 1000 }),
        }).then(r => r.ok ? r.json() : null)
      ))
      const valid = responses.filter(Boolean)
      if (!valid.length) throw new Error('No valid data returned.')
      setResults(valid)
      setMultiResults(valid)   // write to shared context for chatbot

      // AI comparison insight
      try {
        const ir = await fetch('/api/ai/comparison', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stocks: valid.map(r => ({ symbol: r.symbol, expected_return: r.expectedReturn, volatility: r.annualVolatility })),
            days: numDays,
          }),
        })
        if (ir.ok) setInsight((await ir.json()).insight)
      } catch { /* skip */ }
    } catch (e) {
      setError(e.message)
    } finally {
      setRunning(false)
    }
  }

  // Normalised pct chart data — all stocks on % return from day 0
  const compChartData = useMemo(() => {
    if (!results?.length) return []
    const steps = results[0].steps
    return Array.from({ length: steps }, (_, t) => {
      const row = { day: t }
      results.forEach(r => {
        const base = r.paths[0][0]
        // average across paths at step t
        const avg = r.paths.reduce((sum, p) => sum + p[t], 0) / r.paths.length
        row[`pct_${r.symbol}`] = base > 0 ? ((avg - base) / base) * 100 : 0
      })
      return row
    })
  }, [results])

  return (
    <>
      {/* Input panel */}
      <div className="glass-card mb-24">
        {/* Row 1 — shared params */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
          <div className="sim-field">
            <label htmlFor="m-inv">Investment Amount (₹)</label>
            <input id="m-inv" className="sim-input" type="number" min={1000}
              placeholder="e.g. 100000" value={investment}
              onChange={e => setInvestment(e.target.value)} />
          </div>
          <div className="sim-field">
            <label htmlFor="m-days">Simulation Period (Days)</label>
            <input id="m-days" className="sim-input" type="number" min={1} max={365}
              placeholder="e.g. 30" value={days}
              onChange={e => setDays(e.target.value)} />
          </div>
        </div>

        {/* Row 2 — ticker slots */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          {[0, 1, ...(showExtra ? [2, 3] : [])].map(i => (
            <div key={i} className="sim-field" style={{ flex: 1, minWidth: 160 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: SLOT_COLORS[i], flexShrink: 0 }} />
                {`TICKER ${i + 1}`}
              </label>
              <input className="sim-input" type="text"
                placeholder={i === 0 ? 'e.g. RELIANCE.NS' : i === 1 ? 'e.g. TCS.NS' : `e.g. STOCK${i + 1}.NS`}
                value={tickers[i]}
                onChange={e => setTicker(i, e.target.value)} />
            </div>
          ))}
          {!showExtra && (
            <button className="btn-primary" onClick={() => setShowExtra(true)}
              style={{ height: 44, alignSelf: 'flex-end', whiteSpace: 'nowrap', padding: '0 16px' }}>
              + ADD STOCK
            </button>
          )}
          <button className="btn-primary" onClick={runComparison} disabled={running}
            style={{ height: 44, alignSelf: 'flex-end', whiteSpace: 'nowrap' }}>
            {running ? '⟳ RUNNING...' : '▶ RUN COMPARISON'}
          </button>
        </div>
        {error && <div style={{ marginTop: 10, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--red)' }}>⚠ {error}</div>}
      </div>

      {running ? <div className="skeleton skeleton-chart" />
        : results ? (
          <>
            {/* Comparison table */}
            <div className="glass-card mb-20">
              <div style={{ fontFamily: 'var(--font-brand)', fontSize: 13, color: 'var(--text-bright)', marginBottom: 14, letterSpacing: 1.5 }}>
                SIMULATION RESULTS COMPARISON
              </div>
              {/* Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr 1fr 1.2fr', gap: 8, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                {['SYMBOL', 'EXP. RETURN', 'VOLATILITY', 'VaR 95%', 'EXP. FINAL PRICE', 'RISK SCORE'].map(h => (
                  <div key={h} className="caps-label">{h}</div>
                ))}
              </div>
              {/* Best performer = highest return/vol ratio */}
              {(() => {
                const best = results.reduce((a, b) =>
                  (a.expectedReturn / Math.max(a.annualVolatility, 0.001)) > (b.expectedReturn / Math.max(b.annualVolatility, 0.001)) ? a : b)
                return results.map((r, i) => {
                  const riskScore = Math.round(Math.max(0, Math.min(100, 100 - r.annualVolatility * 200)))
                  const isBest = r.symbol === best.symbol
                  return (
                    <div key={i} style={{
                      display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr 1fr 1.2fr',
                      gap: 8, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                      borderLeft: isBest ? '2px solid var(--cyan)' : '2px solid transparent',
                      paddingLeft: isBest ? 8 : 0,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: SLOT_COLORS[i], flexShrink: 0 }} />
                        <span style={{ fontFamily: 'var(--font-brand)', fontSize: 12, color: isBest ? 'var(--cyan)' : 'var(--text-bright)' }}>
                          {r.symbol.replace('.NS', '')}
                        </span>
                        {isBest && <span className="pill pill-cyan" style={{ fontSize: 9, padding: '1px 5px' }}>BEST</span>}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: r.expectedReturn >= 0 ? 'var(--green)' : 'var(--red)' }}>
                        {fmtPct(r.expectedReturn)}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--amber)' }}>
                        {fmtPct(r.annualVolatility)}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--red)' }}>
                        {fmtPct(r.var95)}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-bright)' }}>
                        ₹{r.expectedFinalPrice}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: riskScore > 70 ? 'var(--green)' : riskScore > 40 ? 'var(--amber)' : 'var(--red)', minWidth: 28 }}>
                          {riskScore}
                        </span>
                        <div className="prog-bar" style={{ flex: 1 }}>
                          <div className="prog-fill" style={{
                            width: `${riskScore}%`,
                            background: riskScore > 70 ? 'var(--green)' : riskScore > 40 ? 'var(--amber)' : 'var(--red)',
                          }} />
                        </div>
                      </div>
                    </div>
                  )
                })
              })()}
            </div>

            {/* Single comparison chart — normalised % return */}
            <div className="glass-card scanline-host mb-20" style={{ minHeight: 380 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ fontFamily: 'var(--font-brand)', fontSize: 13, color: 'var(--cyan)', letterSpacing: 1.5 }}>
                  CUMULATIVE RETURN COMPARISON
                </div>
                {/* Legend */}
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  {results.map((r, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: SLOT_COLORS[i] }} />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-mid)' }}>
                        {r.symbol.replace('.NS', '')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={compChartData}>
                    <XAxis dataKey="day" tick={{ fill: 'var(--text)', fontSize: 10 }}
                      label={{ value: 'Trading Days →', position: 'insideBottom', fill: 'var(--text)', fontSize: 10, dy: 8 }} />
                    <YAxis tickFormatter={v => `${v.toFixed(1)}%`} tick={{ fill: 'var(--text)', fontSize: 10 }} width={60} />
                    <Tooltip content={<CompTooltip />} />
                    <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />
                    {results.map((r, i) => (
                      <Line key={r.symbol} type="monotone" dataKey={`pct_${r.symbol}`}
                        stroke={SLOT_HEX[i]} strokeWidth={2} dot={false}
                        isAnimationActive={false} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Comparison Insight */}
            {insight && <AIInsightCard text={insight} />}
          </>
        ) : <EmptyState />}
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT — Tab switcher
// ─────────────────────────────────────────────────────────────────────────────

export default function Simulation() {
  const { setSimMode } = useMontro()
  const [tab, setTab] = useState('single')

  const switchTab = (t) => {
    if (t !== tab) { setTab(t); setSimMode(t) }
  }

  return (
    <div className="page-content" key="simulation">

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        {[
          { id: 'single', label: 'SINGLE STOCK ANALYSIS' },
          { id: 'multi',  label: 'MULTI-STOCK COMPARISON' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => switchTab(t.id)}
            style={{
              padding: '10px 22px', borderRadius: 20, cursor: 'pointer',
              fontFamily: 'var(--font-brand)', fontSize: 11, letterSpacing: 1.5,
              transition: 'all 0.25s ease',
              ...(tab === t.id ? {
                background: 'linear-gradient(135deg, var(--blue), var(--cyan))',
                border: 'none', color: '#fff',
                boxShadow: '0 0 18px rgba(0,242,255,0.3)',
              } : {
                background: 'transparent',
                border: '1px solid rgba(0,242,255,0.35)', color: 'var(--text-mid)',
              }),
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'single' ? <SingleStockTab key="single" /> : <MultiStockTab key="multi" />}
    </div>
  )
}
