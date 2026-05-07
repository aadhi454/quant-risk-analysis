export default function Landing({ navigate }) {
  return (
    <div className="landing-root">
      {/* Background */}
      <div className="landing-bg" />
      <div className="landing-orb orb-cyan" />
      <div className="landing-orb orb-blue" />
      <div className="landing-orb orb-violet" />

      {/* Navbar */}
      <nav className="landing-nav">
        <span className="landing-brand">MONTRO</span>
        <button className="btn-ghost" onClick={() => navigate('login')}>SIGN IN</button>
      </nav>

      {/* Hero */}
      <div className="landing-hero">
        <div className="hero-badge">
          <div className="hero-badge-dot" />
          AI-Powered Quantitative Risk Intelligence
        </div>

        <h1 className="hero-h1">
          INSTITUTIONAL-GRADE
          <span className="cyan-line">RISK ANALYTICS</span>
        </h1>

        <p className="hero-sub">
          Monte Carlo simulation engine built for quantitative analysts,
          portfolio managers, and hedge fund operators.
        </p>

        <div className="hero-ctas">
          <button className="btn-cta-primary" onClick={() => navigate('login')}>
            ENTER PLATFORM →
          </button>
          <button className="btn-cta-secondary" onClick={() => navigate('login')}>
            VIEW DEMO
          </button>
        </div>

        {/* Stats strip */}
        <div className="hero-stats">
          <div className="stat-item">
            <div className="stat-num">10,000+</div>
            <div className="stat-lbl">Simulations / sec</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">95%</div>
            <div className="stat-lbl">VaR Confidence</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">Real-Time</div>
            <div className="stat-lbl">NSE Data Feed</div>
          </div>
        </div>
      </div>

      {/* Decorative blurred preview cards */}
      <div className="landing-previews">
        <div className="preview-card" />
        <div className="preview-card" style={{ height: 160 }} />
        <div className="preview-card" />
      </div>
    </div>
  )
}
