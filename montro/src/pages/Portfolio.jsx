import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { fmtINR } from '../utils'
import { useMontro } from '../context/MontroContext'

const COLORS  = ['var(--cyan)', 'var(--blue)', 'var(--violet)', 'var(--green)', 'var(--red)', 'var(--amber)']
const HEX     = ['#00f2ff', '#1a6bff', '#9b30ff', '#00ffaa', '#ff2d6b', '#ffb800']

const MOCK_DATA = {
  totalAUM: 14200000,
  realizedPnL: 854000,
  unrealizedPnL: 312500,
  portfolioBeta: 1.08,
  holdings: [
    { symbol: 'RELIANCE', exchange: 'NSE', allocation: 0.28, marketValue: 3976000, return: 0.142, risk: 0.68 },
    { symbol: 'TCS',      exchange: 'NSE', allocation: 0.22, marketValue: 3124000, return: 0.089, risk: 0.52 },
    { symbol: 'HDFCBANK', exchange: 'NSE', allocation: 0.18, marketValue: 2556000, return: 0.061, risk: 0.44 },
    { symbol: 'INFY',     exchange: 'NSE', allocation: 0.16, marketValue: 2272000, return: 0.118, risk: 0.58 },
    { symbol: 'BHARTI',   exchange: 'NSE', allocation: 0.10, marketValue: 1420000, return: 0.203, risk: 0.71 },
    { symbol: 'OTHERS',   exchange: 'NSE', allocation: 0.06, marketValue:  852000, return: 0.034, risk: 0.38 },
  ],
  health: { diversification: 74, concentrationRisk: 42, liquidityScore: 88 },
}

function DonutTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="chart-tooltip">
      <div style={{ color: 'var(--text-mid)', fontSize: 10 }}>{d.symbol}</div>
      <div>{(d.allocation * 100).toFixed(1)}%</div>
      <div>{fmtINR(d.marketValue)}</div>
    </div>
  )
}

function HealthTile({ label, score, color }) {
  return (
    <div className="glass-card" style={{ textAlign: 'center', padding: 20 }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 36, color, textShadow: `0 0 14px ${color}66`, marginBottom: 6 }}>{score}</div>
      <div className="caps-label" style={{ marginBottom: 12 }}>{label}</div>
      <div className="prog-bar">
        <div className="prog-fill" style={{ width: `${score}%`, background: color, boxShadow: `0 0 5px ${color}` }} />
      </div>
    </div>
  )
}

export default function Portfolio() {
  const { setPortfolioData } = useMontro()
  const [data, setData]     = useState(MOCK_DATA)
  const [hovered, setHovered] = useState(null)

  useEffect(() => {
    fetch('/api/portfolio/summary')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) { setData(d); setPortfolioData(d) } })
      .catch(() => {})
  }, [])

  const { totalAUM, realizedPnL, unrealizedPnL, portfolioBeta, holdings, health } = data

  return (
    <div className="page-content" key="portfolio">

      {/* KPIs */}
      <div className="grid-4 mb-24">
        {[
          { label: 'TOTAL AUM',      value: fmtINR(totalAUM),      color: 'var(--cyan)'   },
          { label: 'REALIZED P&L',   value: fmtINR(realizedPnL),   color: 'var(--green)'  },
          { label: 'UNREALIZED P&L', value: fmtINR(unrealizedPnL), color: unrealizedPnL >= 0 ? 'var(--green)' : 'var(--red)' },
          { label: 'PORTFOLIO BETA', value: portfolioBeta?.toFixed(2), color: 'var(--amber)' },
        ].map((k, i) => (
          <div key={i} className="glass-card">
            <div className="caps-label" style={{ marginBottom: 8 }}>{k.label}</div>
            <div className="kpi-value" style={{ color: k.color, fontSize: 20 }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Main layout */}
      <div className="grid-2-port mb-24">

        {/* Donut */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontFamily: 'var(--font-brand)', fontSize: 13, marginBottom: 16, color: 'var(--text-bright)' }}>
            ASSET ALLOCATION
          </div>
          <div style={{ position: 'relative', height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={holdings}
                  dataKey="allocation"
                  nameKey="symbol"
                  innerRadius={70}
                  outerRadius={108}
                  paddingAngle={2}
                  stroke="none"
                  onMouseEnter={(_, i) => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {holdings.map((_, i) => (
                    <Cell
                      key={i}
                      fill={HEX[i % HEX.length]}
                      opacity={hovered == null || hovered === i ? 1 : 0.35}
                      style={{
                        filter: hovered === i ? `drop-shadow(0 0 10px ${HEX[i % HEX.length]})` : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.25s',
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<DonutTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="donut-center">
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--text-bright)' }}>
                {fmtINR(totalAUM)}
              </div>
              <div className="caps-label">TOTAL AUM</div>
            </div>
          </div>

          {/* Legend */}
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {holdings.map((h, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: HEX[i % HEX.length] }} />
                  <span style={{ fontFamily: 'var(--font-brand)', fontSize: 11 }}>{h.symbol}</span>
                </div>
                <div style={{ display: 'flex', gap: 12, fontFamily: 'var(--font-mono)' }}>
                  <span style={{ color: 'var(--text-mid)', fontSize: 11 }}>{(h.allocation * 100).toFixed(1)}%</span>
                  <span style={{ color: h.return >= 0 ? 'var(--green)' : 'var(--red)', fontSize: 11 }}>
                    {h.return >= 0 ? '+' : ''}{(h.return * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right stack */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Holdings table */}
          <div className="glass-card" style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-brand)', fontSize: 13, marginBottom: 14, color: 'var(--text-bright)' }}>HOLDINGS LEDGER</div>
            <div className="holdings-row" style={{ paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
              {['SYMBOL', 'ALLOC', 'MARKET VALUE', 'RETURN', 'RISK'].map(h => (
                <div key={h} className="holdings-head">{h}</div>
              ))}
            </div>
            {holdings.map((h, i) => (
              <div key={i} className="holdings-row">
                <div>
                  <div style={{ fontFamily: 'var(--font-brand)', fontSize: 12, color: 'var(--text-bright)' }}>{h.symbol}</div>
                  <div className="caps-label">{h.exchange}</div>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-bright)' }}>
                    {(h.allocation * 100).toFixed(1)}%
                  </div>
                  <div style={{ height: 2, width: 40, background: `linear-gradient(90deg, ${HEX[i % HEX.length]}, transparent)`, marginTop: 4, borderRadius: 1 }} />
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-bright)' }}>
                  {fmtINR(h.marketValue)}
                </div>
                <div>
                  <span className={`pill ${h.return >= 0 ? 'pill-green' : 'pill-red'}`}>
                    {h.return >= 0 ? '+' : ''}{(h.return * 100).toFixed(2)}%
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div className="prog-bar" style={{ width: 60 }}>
                    <div className="prog-fill" style={{ width: `${h.risk * 100}%`, background: HEX[i % HEX.length] }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Health tiles */}
          <div className="grid-3">
            <HealthTile label="DIVERSIFICATION"   score={health.diversification}  color="var(--green)"  />
            <HealthTile label="CONCENTRATION RISK" score={health.concentrationRisk} color="var(--amber)"  />
            <HealthTile label="LIQUIDITY SCORE"   score={health.liquidityScore}   color="var(--cyan)"   />
          </div>

        </div>
      </div>
    </div>
  )
}
