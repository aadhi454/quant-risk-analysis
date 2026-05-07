import { useState, useEffect, useCallback } from 'react'

const IST_OFFSET = 5.5 * 60 * 60 * 1000

export function useIST() {
  const [time, setTime] = useState(() => new Date(Date.now() + IST_OFFSET))

  useEffect(() => {
    const id = setInterval(() => {
      setTime(new Date(Date.now() + IST_OFFSET))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const isMarketOpen = (() => {
    const h = time.getUTCHours()
    const m = time.getUTCMinutes()
    const day = time.getUTCDay()
    if (day === 0 || day === 6) return false
    const mins = h * 60 + m
    return mins >= 555 && mins <= 930  // 09:15–15:30
  })()

  const pad = n => String(n).padStart(2, '0')
  const hh = pad(time.getUTCHours())
  const mm = pad(time.getUTCMinutes())
  const ss = pad(time.getUTCSeconds())

  return { hh, mm, ss, isMarketOpen }
}

export function useAPI(url, opts = {}) {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(url, opts)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setData(await res.json())
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [url])

  useEffect(() => { refetch() }, [refetch])

  return { data, loading, error, refetch }
}

export function lerp(a, b, t) { return a + (b - a) * t }

export function pathColor(index, total) {
  const t = total <= 1 ? 0 : index / (total - 1)
  const r = Math.round(lerp(0,   155, t))
  const g = Math.round(lerp(242, 48,  t))
  const b = Math.round(lerp(255, 255, t))
  return `rgb(${r},${g},${b})`
}

export function fmtINR(v) {
  if (v == null) return '—'
  return '₹' + Number(v).toLocaleString('en-IN', { maximumFractionDigits: 2 })
}

export function fmtPct(v, decimals = 2) {
  if (v == null) return '—'
  return (Number(v) * 100).toFixed(decimals) + '%'
}
