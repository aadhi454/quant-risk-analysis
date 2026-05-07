import { useState, useEffect } from 'react'
import { useIST } from '../utils'

export default function Sidebar({ page, setPage }) {
  const { isMarketOpen } = useIST()

  const nav = [
    { id: 'dashboard',  glyph: '◱', label: 'DASHBOARD',   sub: 'Global Intel'    },
    { id: 'simulation', glyph: '⟳', label: 'SIMULATION',  sub: 'Monte Carlo'     },
    { id: 'portfolio',  glyph: '⬡', label: 'PORTFOLIO',   sub: 'Risk Ecosystem'  },
    { id: 'settings',   glyph: '⚙', label: 'SETTINGS',    sub: 'System Config'   },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-name">MONTRO</span>
        <span className="brand-sub">MONTE CARLO RISK OPS</span>
      </div>

      <nav className="sidebar-nav">
        {nav.map(n => (
          <div
            key={n.id}
            className={`nav-item${page === n.id ? ' active' : ''}`}
            onClick={() => setPage(n.id)}
          >
            <span className="nav-glyph">{n.glyph}</span>
            <div className="nav-labels">
              <span className="nav-label">{n.label}</span>
              <span className="nav-sublabel">{n.sub}</span>
            </div>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="status-row">
          <div className="dot-live" />
          <span className="status-label">SYSTEMS NOMINAL</span>
        </div>
        <div className="stat-row"><span>UPTIME</span><span style={{ color: 'var(--green)' }}>99.99%</span></div>
        <div className="stat-row"><span>LATENCY</span><span style={{ color: 'var(--cyan)' }}>12ms</span></div>
        <div className="stat-row"><span>NSE</span><span style={{ color: isMarketOpen ? 'var(--green)' : 'var(--red)' }}>{isMarketOpen ? 'OPEN' : 'CLOSED'}</span></div>
      </div>
    </aside>
  )
}
