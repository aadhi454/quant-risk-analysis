import { useState, useEffect } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import { fmtINR, useIST } from '../utils'
import { useMontro } from '../context/MontroContext'

// ── AI sentences ──────────────────────────────────────────────────────────────
const AI_SENTENCES = [
  'Analyzing RSI divergence on HDFCBANK... Institutional accumulation detected across F&O data.',
  'NIFTY 50 options skew elevated. Smart money hedging suggests caution beyond 25,200.',
  'FII inflows into IT sector strong. TCS and INFY showing high-momentum breakout signals.',
  'VIX remains subdued at 12.4. Environment favors high-beta positions with defined exits.',
]

const TRENDING = [
  { sym: 'HDFCBANK',  exch: 'NSE', price: '1,912.75', change: '+0.87', up: true  },
  { sym: 'INFY',      exch: 'NSE', price: '1,548.20', change: '+2.15', up: true  },
  { sym: 'BAJFINANCE',exch: 'NSE', price: '8,920.15', change: '+1.89', up: true  },
  { sym: 'TCS',       exch: 'NSE', price: '3,489.10', change: '-0.38', up: false },
  { sym: 'ADANIENT',  exch: 'NSE', price: '2,410.80', change: '-2.34', up: false },
  { sym: 'WIPRO',     exch: 'NSE', price:   '485.10', change: '+1.40', up: true  },
]

const RISK_METRICS = [
  { label: 'Beta vs NIFTY',    value: '1.08', pct: 54, color: 'var(--cyan)'   },
  { label: 'Max Drawdown',     value: '-12.4%', pct: 24, color: 'var(--red)'  },
  { label: 'Alpha (Annual)',   value: '+3.4%', pct: 68, color: 'var(--green)' },
  { label: 'Correlation',      value: '0.82', pct: 82, color: 'var(--violet)' },
  { label: 'Info Ratio',       value: '0.67', pct: 33, color: 'var(--blue)'   },
]

// ── Custom tooltip ────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <div style={{ color: 'var(--text-mid)', marginBottom: 4, fontSize: 10 }}>{label}</div>
      <div style={{ color: 'var(--cyan)' }}>₹{Number(payload[0].value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
    </div>
  )
}

// ── KPI card ──────────────────────────────────────────────────────────────────
function KPICard({ label, value, sub, accent }) {
  return (
    <div className="glass-card" style={{ minHeight: 120 }}>
      <div style={{
        position: 'absolute', top: -16, right: -16, width: 80, height: 80,
        background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)`,
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${accent}, transparent)`,
        borderRadius: '0 0 14px 14px',
      }} />
      <div className="caps-label" style={{ marginBottom: 10 }}>{label}</div>
      <div className="kpi-value" style={{ color: accent, textShadow: `0 0 10px ${accent}55` }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: accent, marginTop: 8 }}>{sub}</div>
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { setMarketData } = useMontro()
  const { isMarketOpen } = useIST()
  const [chartData, setChartData] = useState([])
  const [aiIdx, setAiIdx] = useState(0)
  const [typed, setTyped] = useState('')

  // Push market status to shared context for chatbot
  useEffect(() => {
    setMarketData({ market_status: isMarketOpen ? 'open' : 'closed', nifty_change: 0.78 })
  }, [isMarketOpen, setMarketData])

  // Load chart
  useEffect(() => {
    fetch('/api/stock/history?symbol=RELIANCE.NS&days=90')
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setChartData(d))
      .catch(() => {})
  }, [])

  // Typewriter
  useEffect(() => {
    let i = 0
    const sentence = AI_SENTENCES[aiIdx]
    setTyped('')
    const iv = setInterval(() => {
      if (i < sentence.length) {
        setTyped(sentence.slice(0, ++i))
      } else {
        clearInterval(iv)
        setTimeout(() => setAiIdx(prev => (prev + 1) % AI_SENTENCES.length), 3800)
      }
    }, 22)
    return () => clearInterval(iv)
  }, [aiIdx])

  const score = 78

  return (
    <div className="page-content" key="dashboard">

      {/* Row 1 — KPIs */}
      <div className="grid-4 mb-24">
        <KPICard label="NIFTY 50"       value="24,680"    sub="+0.78% TODAY"   accent="var(--cyan)"   />
        <KPICard label="PORTFOLIO NAV"  value="₹14.2M"    sub="+12.4% YTD"     accent="var(--green)"  />
        <KPICard label="PORTFOLIO VaR"  value="₹312.4K"   sub="1-DAY 95% CONF" accent="var(--red)"    />
        <KPICard label="SHARPE RATIO"   value="1.42"      sub="90-DAY ROLLING"  accent="var(--violet)" />
      </div>

      {/* Row 2 */}
      <div className="grid-2-fr mb-24">

        {/* Price chart */}
        <div className="glass-card scanline-host" style={{ minHeight: 340 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-brand)', fontSize: 18, color: 'var(--text-bright)' }}>RELIANCE</div>
              <div className="caps-label">NSE EQ</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--cyan)', textShadow: '0 0 8px rgba(0,242,255,0.4)' }}>₹2,928.45</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--green)' }}>+1.24%</div>
            </div>
          </div>

          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--cyan)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--cyan)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" hide />
                <YAxis domain={['auto', 'auto']} hide />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="close"
                  stroke="var(--cyan)"
                  strokeWidth={1.5}
                  fill="url(#areaGrad)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="caps-label" style={{ color: 'var(--cyan)', letterSpacing: 2, marginBottom: 16 }}>
            MONTRO NEURAL ANALYSIS
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div className="caps-label">BULLISH SCORE</div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 36,
              color: score >= 60 ? 'var(--green)' : score >= 40 ? 'var(--amber)' : 'var(--red)',
              textShadow: '0 0 12px currentColor',
            }}>{score}</div>
          </div>

          <div className="prog-bar" style={{ marginBottom: 16 }}>
            <div className="prog-fill" style={{
              width: `${score}%`,
              background: 'linear-gradient(90deg, var(--cyan), var(--green))',
            }} />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            <span className="pill pill-green">RSI DIVERGENCE</span>
            <span className="pill pill-green">FII INFLOWS</span>
            <span className="pill pill-green">TREND UP</span>
            <span className="pill pill-red">PUT SKEW ↑</span>
            <span className="pill pill-cyan">LOW VIX</span>
          </div>

          <div className="divider" />

          <div className="typewriter-area" style={{ flex: 1 }}>
            <span className="ai-prefix">&gt;</span>
            {typed}
            <span className="cursor">█</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text)' }}>MODEL v4.2.1</span>
            <div className="dot-live" />
          </div>
        </div>
      </div>

      {/* Row 3 */}
      <div className="grid-2-eq">

        {/* Trending stocks */}
        <div className="glass-card">
          <div className="section-header">
            <span style={{ color: 'var(--cyan)' }}>◈</span>
            <span className="section-title">TRENDING NSE</span>
            <div className="section-rule" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {TRENDING.map((s, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '9px 6px', borderBottom: '1px solid rgba(255,255,255,0.04)',
                cursor: 'pointer', transition: 'background 0.15s', borderRadius: 6,
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,242,255,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div>
                  <div style={{ fontFamily: 'var(--font-brand)', fontSize: 13, color: 'var(--text-bright)' }}>{s.sym}</div>
                  <div className="caps-label">{s.exch}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-bright)', fontSize: 13 }}>₹{s.price}</div>
                  <span className={`pill ${s.up ? 'pill-green' : 'pill-red'}`} style={{ marginTop: 4, display: 'inline-block' }}>
                    {s.change}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk snapshot */}
        <div className="glass-card">
          <div className="section-header">
            <span style={{ color: 'var(--violet)' }}>◈</span>
            <span className="section-title">RISK SNAPSHOT</span>
            <div className="section-rule" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {RISK_METRICS.map((m, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span className="caps-label">{m.label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: m.color, fontSize: 13 }}>{m.value}</span>
                </div>
                <div className="prog-bar">
                  <div className="prog-fill" style={{ width: `${m.pct}%`, background: m.color, boxShadow: `0 0 6px ${m.color}` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Platform Overview ───────────────────────────────────── */}
      <div className="glass-card" style={{ marginTop: 22, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36 }}>

        {/* LEFT — About MONTRO */}
        <div>
          <div className="section-header" style={{ marginBottom: 20 }}>
            <span style={{ color: 'var(--cyan)' }}>◈</span>
            <span className="section-title">ABOUT MONTRO</span>
            <div className="section-rule" />
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-bright)', fontFamily: 'var(--font-body)', marginBottom: 10 }}>
              What is MONTRO?
            </div>
            <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.8 }}>
              MONTRO is an institutional-grade quantitative risk analytics platform built for
              portfolio managers, quantitative analysts, and hedge fund operators. It combines
              real-time market data with advanced probabilistic modeling to deliver actionable
              risk intelligence at the speed of modern markets.
            </div>
          </div>

          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-bright)', fontFamily: 'var(--font-body)', marginBottom: 10 }}>
              What is Monte Carlo Analysis?
            </div>
            <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.8 }}>
              Monte Carlo simulation runs thousands of randomized scenarios based on historical
              volatility and drift to model the full probability distribution of future asset
              prices. Rather than a single prediction, it reveals the realistic range of outcomes
              — giving analysts a statistically rigorous foundation for position sizing, risk
              budgeting, and portfolio construction.
            </div>
          </div>
        </div>

        {/* RIGHT — Capabilities */}
        <div>
          <div className="section-header" style={{ marginBottom: 20 }}>
            <span style={{ color: 'var(--violet)' }}>◈</span>
            <span className="section-title">PLATFORM CAPABILITIES</span>
            <div className="section-rule" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              { icon: '⌬', title: 'Monte Carlo Engine',      desc: '1,000-path simulation with full distribution analysis',        accent: 'var(--cyan)'   },
              { icon: '⬡', title: 'Real-Time Market Data',   desc: 'Live NSE/BSE feed with sub-second price updates',              accent: 'var(--blue)'   },
              { icon: '◎', title: 'AI Risk Intelligence',    desc: 'Neural analysis generating contextual investment insights',     accent: 'var(--violet)' },
              { icon: '◇', title: 'Multi-Asset Comparison',  desc: 'Side-by-side quantitative comparison across equities',         accent: 'var(--green)'  },
            ].map((cap, i) => (
              <div key={i} style={{
                background: 'rgba(1,8,18,0.4)',
                border: `1px solid ${cap.accent}33`,
                borderRadius: 10, padding: '16px 18px',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                cursor: 'default',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = cap.accent
                  e.currentTarget.style.boxShadow = `0 0 16px ${cap.accent}22`
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = `${cap.accent}33`
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div style={{ fontSize: 18, color: cap.accent, marginBottom: 8 }}>{cap.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-bright)', marginBottom: 6 }}>{cap.title}</div>
                <div style={{ fontSize: 11, color: 'var(--text)', lineHeight: 1.6 }}>{cap.desc}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  )
}
