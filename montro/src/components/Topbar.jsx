import { useIST } from '../utils'

const PAGE_LABELS = {
  dashboard:  'Dashboard',
  simulation: 'Simulation',
  portfolio:  'Portfolio',
  settings:   'Settings',
}

export default function Topbar({ page }) {
  const { hh, mm, ss, isMarketOpen } = useIST()

  return (
    <header className="topbar">
      <div className="topbar-breadcrumb">
        MONTRO <span>›</span> {PAGE_LABELS[page]}
      </div>

      <div className="topbar-right">
        <div className="topbar-clock">
          {hh}<span className="colon">:</span>{mm}<span className="colon">:</span>{ss}
          <span className="topbar-timezone">IST</span>
        </div>
        <div className="market-status">
          <div
            className="market-dot"
            style={{ background: isMarketOpen ? 'var(--green)' : 'var(--red)' }}
          />
          <span
            className="market-status-text"
            style={{ color: isMarketOpen ? 'var(--green)' : 'var(--red)' }}
          >
            {isMarketOpen ? 'MARKET OPEN' : 'MARKET CLOSED'}
          </span>
        </div>
      </div>
    </header>
  )
}
