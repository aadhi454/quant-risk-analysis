import { useState } from 'react'

function Toggle({ on, onChange }) {
  return (
    <div className={`toggle-btn ${on ? 'on' : 'off'}`} onClick={() => onChange(!on)}>
      <div className="toggle-knob" />
    </div>
  )
}

function SettingsPanel({ accent, icon, title, children }) {
  return (
    <div className="glass-card mb-20" style={{ padding: '20px 24px' }}>
      <div className="caps-label" style={{ color: accent, letterSpacing: 2, marginBottom: 16 }}>
        {icon} {title}
      </div>
      {children}
    </div>
  )
}

const THEMES = [
  { name: 'VOID BLACK', c1: '#010812', c2: '#00f2ff' },
  { name: 'DEEP NAVY',  c1: '#0a192f', c2: '#64ffda' },
  { name: 'NEON VIOLET',c1: '#120b29', c2: '#9b30ff' },
]

export default function Settings() {
  const [toggles, setToggles] = useState({
    liveMarket: true, streaming: false,
    aiInsights: true, autoSim: false,
    push: true, voice: false, risk: true,
  })
  const [theme, setTheme] = useState('VOID BLACK')

  const set = (key, v) => setToggles(prev => ({ ...prev, [key]: v }))

  return (
    <div className="page-content" key="settings">
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24 }}>

        {/* Profile */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 40, height: 'fit-content' }}>
          <div style={{
            width: 100, height: 100, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--bg1), var(--bg0))',
            border: '2px solid var(--cyan)', boxShadow: '0 0 20px rgba(0,242,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 20,
          }}>
            <span style={{ fontFamily: 'var(--font-brand)', fontSize: 32, color: 'var(--text-bright)' }}>Q</span>
          </div>
          <div style={{ fontFamily: 'var(--font-brand)', fontSize: 17, marginBottom: 4 }}>ALEX MERCER</div>
          <div className="caps-label" style={{ color: 'var(--cyan)', marginBottom: 24, letterSpacing: 2 }}>QUANTITATIVE STRATEGIST</div>

          {[
            { l: 'ACCOUNT TIER',   v: 'INSTITUTIONAL' },
            { l: 'API CALLS',      v: '42,108 / 100K'  },
            { l: 'MODEL VERSION',  v: 'MONTRO-v4.2.1'  },
            { l: 'RISK PROFILE',   v: 'AGGRESSIVE'     },
          ].map((s, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', width: '100%',
              borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '10px 0',
            }}>
              <span className="caps-label">{s.l}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-bright)' }}>{s.v}</span>
            </div>
          ))}

          <button
            className="btn-primary"
            style={{ marginTop: 24, width: '100%' }}
            onClick={() => {}}
          >
            MANAGE SUBSCRIPTION
          </button>
        </div>

        {/* Right panels */}
        <div>
          <SettingsPanel accent="var(--cyan)" icon="⬡" title="DATA & FEEDS">
            <div className="toggle-wrap">
              <div className="toggle-info">
                <span className="toggle-title">Live Market Data</span>
                <span className="toggle-desc">NSE WebSocket feed — 12ms latency</span>
              </div>
              <Toggle on={toggles.liveMarket} onChange={v => set('liveMarket', v)} />
            </div>
            <div className="toggle-wrap">
              <div className="toggle-info">
                <span className="toggle-title">Streaming Mode</span>
                <span className="toggle-desc">Continuous VaR recalculation on tick data</span>
              </div>
              <Toggle on={toggles.streaming} onChange={v => set('streaming', v)} />
            </div>
          </SettingsPanel>

          <SettingsPanel accent="var(--violet)" icon="◎" title="AI INTELLIGENCE">
            <div className="toggle-wrap">
              <div className="toggle-info">
                <span className="toggle-title">AI Market Insights</span>
                <span className="toggle-desc">Neural analysis typewriter on Dashboard</span>
              </div>
              <Toggle on={toggles.aiInsights} onChange={v => set('aiInsights', v)} />
            </div>
            <div className="toggle-wrap">
              <div className="toggle-info">
                <span className="toggle-title">Auto Simulation</span>
                <span className="toggle-desc">Background MC paths on portfolio holdings</span>
              </div>
              <Toggle on={toggles.autoSim} onChange={v => set('autoSim', v)} />
            </div>
          </SettingsPanel>

          <SettingsPanel accent="var(--amber)" icon="△" title="ALERTS & COMMS">
            <div className="toggle-wrap">
              <div className="toggle-info"><span className="toggle-title">Push Notifications</span></div>
              <Toggle on={toggles.push} onChange={v => set('push', v)} />
            </div>
            <div className="toggle-wrap">
              <div className="toggle-info"><span className="toggle-title">Voice Alerts</span></div>
              <Toggle on={toggles.voice} onChange={v => set('voice', v)} />
            </div>
            <div className="toggle-wrap">
              <div className="toggle-info"><span className="toggle-title">Risk Breach Alerts</span></div>
              <Toggle on={toggles.risk} onChange={v => set('risk', v)} />
            </div>
          </SettingsPanel>

          <div className="glass-card" style={{ padding: '20px 24px' }}>
            <div className="caps-label" style={{ marginBottom: 16, letterSpacing: 2 }}>VISUAL THEME</div>
            <div className="grid-3">
              {THEMES.map(t => (
                <div key={t.name} className={`theme-tile${theme === t.name ? ' active' : ''}`} onClick={() => setTheme(t.name)}>
                  <div className="theme-swatches">
                    <div className="swatch" style={{ background: t.c1 }} />
                    <div className="swatch" style={{ background: t.c2 }} />
                  </div>
                  <div className="caps-label">{t.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
