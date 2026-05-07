import { createContext, useContext, useState } from 'react'

const MontroCtx = createContext(null)

export function MontroProvider({ children }) {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [simMode,     setSimMode]     = useState('single')
  const [simResult,   setSimResult]   = useState(null)
  const [multiResults,setMultiResults]= useState(null)
  const [portfolioData,setPortfolioData]=useState(null)
  const [marketData,  setMarketData]  = useState({ market_status: 'closed', nifty_change: 0.78 })

  return (
    <MontroCtx.Provider value={{
      currentPage, setCurrentPage,
      simMode,     setSimMode,
      simResult,   setSimResult,
      multiResults,setMultiResults,
      portfolioData,setPortfolioData,
      marketData,  setMarketData,
    }}>
      {children}
    </MontroCtx.Provider>
  )
}

export const useMontro = () => useContext(MontroCtx)
