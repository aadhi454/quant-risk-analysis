import { useState, useEffect } from 'react'

const MOCK = [
  { symbol: 'RELIANCE',  price: 2928.45, change:  1.24 },
  { symbol: 'TCS',       price: 3489.10, change: -0.38 },
  { symbol: 'HDFCBANK',  price: 1912.75, change:  0.87 },
  { symbol: 'INFY',      price: 1548.20, change:  2.15 },
  { symbol: 'WIPRO',     price:  485.10, change:  1.40 },
  { symbol: 'BHARTIARTL',price: 1380.55, change:  0.62 },
  { symbol: 'ICICIBANK', price: 1104.30, change:  1.10 },
  { symbol: 'ADANIENT',  price: 2410.80, change: -2.34 },
  { symbol: 'SBIN',      price:  760.50, change: -1.10 },
  { symbol: 'NIFTY 50',  price:24680.50, change:  0.78 },
  { symbol: 'SENSEX',    price:81224.75, change:  0.65 },
  { symbol: 'BAJFINANCE',price: 8920.15, change:  1.89 },
]

export default function TickerTape() {
  const [tickers, setTickers] = useState(MOCK)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/market/ticker')
        if (res.ok) setTickers(await res.json())
      } catch { /* keep mock */ }
    }
    load()
    const id = setInterval(load, 30000)
    return () => clearInterval(id)
  }, [])

  const items = [...tickers, ...tickers]

  return (
    <div className="ticker-tape">
      <div className="ticker-track">
        {items.map((t, i) => (
          <div key={i} className="ticker-item">
            <span className="ticker-sym">{t.symbol}</span>
            <span className="ticker-price">₹{Number(t.price).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            <span className={t.change >= 0 ? 'ticker-up' : 'ticker-down'}>
              {t.change >= 0 ? '▲' : '▼'} {Math.abs(t.change).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
