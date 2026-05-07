import { useState, useEffect } from 'react'
import { useMontro } from './context/MontroContext'
import Landing    from './pages/Landing'
import Login      from './pages/Login'
import Sidebar    from './components/Sidebar'
import Topbar     from './components/Topbar'
import TickerTape from './components/TickerTape'
import MontroAI   from './components/MontroAI'
import Dashboard  from './pages/Dashboard'
import Simulation from './pages/Simulation'
import Portfolio  from './pages/Portfolio'
import Settings   from './pages/Settings'

const INNER = { dashboard: Dashboard, simulation: Simulation, portfolio: Portfolio, settings: Settings }

export default function App() {
  const { setCurrentPage } = useMontro()
  const [route, setRoute] = useState('landing')
  const [page,  setPage]  = useState('dashboard')

  // Sync inner page → shared context so chatbot knows which page is active
  useEffect(() => { setCurrentPage(page) }, [page, setCurrentPage])

  if (route === 'landing') {
    return <><div className="montro-bg" /><Landing navigate={setRoute} /></>
  }

  if (route === 'login') {
    return (
      <>
        <div className="montro-bg" />
        <Login navigate={r => { if (r === 'dashboard') { setRoute('dashboard') } else { setRoute(r) } }} />
      </>
    )
  }

  const InnerPage = INNER[page] ?? Dashboard
  return (
    <>
      <div className="montro-bg" />
      <div className="app-shell">
        <Sidebar page={page} setPage={setPage} />
        <div className="main-wrapper">
          <Topbar page={page} />
          <TickerTape />
          <InnerPage key={page} />
        </div>
      </div>
      {/* Chatbot lives outside the page scroll area, always on top */}
      <MontroAI />
    </>
  )
}
