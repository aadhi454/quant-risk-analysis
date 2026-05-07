import { useState } from 'react'

export default function Login({ navigate }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)

  const handleAuth = () => {
    if (loading) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      navigate('dashboard')
    }, 1200)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') handleAuth()
  }

  return (
    <div className="login-root">
      {/* Shared orb background */}
      <div className="landing-orb orb-cyan"   style={{ opacity: 0.7 }} />
      <div className="landing-orb orb-violet" style={{ opacity: 0.6 }} />
      <div className="login-bg-orb" />

      <div className="login-card">
        {/* Header */}
        <div className="login-logo">MONTRO</div>
        <div className="login-subtitle">Secure Access</div>
        <div className="login-divider" />

        {/* Email */}
        <div className="input-group-login">
          <label className="input-label">Analyst ID / Email</label>
          <input
            className="glass-input"
            type="email"
            placeholder="analyst@montro.io"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={handleKey}
            autoComplete="off"
          />
        </div>

        {/* Password */}
        <div className="input-group-login">
          <label className="input-label">Passcode</label>
          <div className="input-pw-wrap">
            <input
              className="glass-input"
              type={showPw ? 'text' : 'password'}
              placeholder="••••••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={handleKey}
            />
            <span
              className="pw-toggle"
              onClick={() => setShowPw(p => !p)}
              title={showPw ? 'Hide' : 'Show'}
            >
              {showPw ? '○' : '●'}
            </span>
          </div>
        </div>

        {/* Auth button */}
        <button
          className="btn-auth"
          onClick={handleAuth}
          disabled={loading}
        >
          {loading ? 'AUTHENTICATING...' : 'AUTHENTICATE →'}
        </button>

        <div className="login-forgot">
          Forgot credentials? Contact your administrator.
        </div>

        {/* Enc badge */}
        <div className="login-enc-badge">
          <span>🔒</span>
          <span>256-BIT ENCRYPTED SESSION</span>
        </div>
      </div>

      {/* Back link */}
      <div style={{
        position: 'absolute', bottom: 28, left: 0, right: 0,
        textAlign: 'center',
        fontSize: 11, color: 'var(--text)', letterSpacing: 1,
      }}>
        <span
          style={{ cursor: 'pointer', borderBottom: '1px solid rgba(0,242,255,0.25)', paddingBottom: 2 }}
          onClick={() => navigate('landing')}
        >
          ← BACK TO MONTRO
        </span>
      </div>
    </div>
  )
}
