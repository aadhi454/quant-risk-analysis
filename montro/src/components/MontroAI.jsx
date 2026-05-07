import { useState, useEffect, useRef, useCallback } from 'react'
import { useMontro } from '../context/MontroContext'

const WELCOME =
  "Hello. I'm MONTRO AI — your quantitative risk advisor. Ask me anything about your simulation results, portfolio performance, or current market conditions."

const CHIPS = [
  'Is this stock risky?',
  'Explain my simulation',
  'How is my portfolio?',
  'Which stock is safer?',
]

let _msgId = 0
const uid = () => ++_msgId

// ── Typing dots indicator ──────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 4, padding: '10px 14px', alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 6, height: 6, borderRadius: '50%',
          background: 'var(--cyan)', opacity: 0.7,
          animation: `dot-pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text)', marginLeft: 8 }}>
        MONTRO AI is analyzing...
      </span>
    </div>
  )
}

// ── Single message bubble ──────────────────────────────────────────────────────
function Bubble({ msg }) {
  const isUser = msg.role === 'user'
  const text = msg.displayText ?? msg.text
  const showCursor = !msg.done && msg.role === 'ai' && !msg.isTyping

  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
      <div style={{ maxWidth: isUser ? '80%' : '85%' }}>
        <div style={{
          padding: '10px 14px', fontSize: 13, lineHeight: 1.7,
          fontFamily: 'var(--font-body)',
          borderRadius: isUser ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
          ...(isUser ? {
            background: 'linear-gradient(135deg, rgba(26,107,255,0.25), rgba(0,242,255,0.15))',
            border: '1px solid rgba(0,242,255,0.2)',
            color: 'var(--text-bright)',
          } : {
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--border)',
            color: 'var(--text-mid)',
          }),
        }}>
          {msg.isTyping ? <TypingDots /> : (
            <>{text}{showCursor && <span style={{ animation: 'type-cursor 0.7s infinite', fontFamily: 'var(--font-mono)', marginLeft: 1 }}>▌</span>}</>
          )}
        </div>
        <div style={{
          fontSize: 10, color: 'var(--text)', marginTop: 4,
          textAlign: isUser ? 'right' : 'left', opacity: 0.5,
          fontFamily: 'var(--font-mono)',
        }}>
          {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  )
}

// ── Main chatbot component ─────────────────────────────────────────────────────
export default function MontroAI() {
  const { currentPage, simMode, simResult, multiResults, portfolioData, marketData } = useMontro()

  const [open,       setOpen]       = useState(false)
  const [messages,   setMessages]   = useState([])
  const [input,      setInput]      = useState('')
  const [loading,    setLoading]    = useState(false)
  const [chipsSent,  setChipsSent]  = useState(false)
  const [tooltip,    setTooltip]    = useState(false)
  const bottomRef   = useRef(null)
  const inputRef    = useRef(null)
  const welcomeShown = useRef(false)

  // ── Typewriter for AI messages ────────────────────────────────────────────
  const typeMessage = useCallback((id, text) => {
    let i = 0
    const iv = setInterval(() => {
      i++
      setMessages(prev =>
        prev.map(m => m.id === id ? { ...m, displayText: text.slice(0, i) } : m)
      )
      if (i >= text.length) {
        clearInterval(iv)
        setMessages(prev => prev.map(m => m.id === id ? { ...m, done: true } : m))
      }
    }, 18)
  }, [])

  const addAIMessage = useCallback((text) => {
    const id = uid()
    setMessages(prev => [...prev, {
      id, role: 'ai', text, displayText: '', timestamp: new Date(), done: false,
    }])
    typeMessage(id, text)
  }, [typeMessage])

  // ── Show welcome on first open ────────────────────────────────────────────
  useEffect(() => {
    if (open && !welcomeShown.current) {
      welcomeShown.current = true
      addAIMessage(WELCOME)
    }
    if (open) setTimeout(() => inputRef.current?.focus(), 300)
  }, [open, addAIMessage])

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Build context payload ─────────────────────────────────────────────────
  const buildContext = () => {
    const ctx = {
      mode: currentPage === 'simulation' ? simMode : currentPage,
      market_status: marketData.market_status,
      nifty_change:  marketData.nifty_change,
    }
    if (currentPage === 'simulation' && simMode === 'single' && simResult) {
      ctx.symbol            = simResult.symbol
      ctx.investment_amount = simResult.startingPrice
      ctx.days              = simResult.steps
      ctx.expected_return   = simResult.expectedReturn * 100
      ctx.volatility        = simResult.annualVolatility * 100
      ctx.var_95            = Math.abs(simResult.var95) * 100
      ctx.expected_shortfall= Math.abs(simResult.es95) * 100
      ctx.expected_final_price = simResult.expectedFinalPrice
    }
    if (currentPage === 'simulation' && simMode === 'multi' && multiResults?.length) {
      ctx.symbols = multiResults.map(r => r.symbol)
    }
    if (currentPage === 'portfolio' && portfolioData?.holdings) {
      ctx.portfolio = portfolioData.holdings.map(h => ({
        symbol: h.symbol, allocation: h.allocation * 100, return: h.return * 100,
      }))
    }
    return ctx
  }

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSend = async (text) => {
    const msg = (text ?? input).trim()
    if (!msg || loading) return
    setChipsSent(true)
    setInput('')
    setLoading(true)

    setMessages(prev => [...prev, {
      id: uid(), role: 'user', text: msg, displayText: msg,
      timestamp: new Date(), done: true,
    }])

    const tId = uid()
    setMessages(prev => [...prev, {
      id: tId, role: 'ai', text: '', displayText: '', timestamp: new Date(), isTyping: true,
    }])

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, context: buildContext() }),
      })
      const data = await res.json()
      const reply = data.reply || 'MONTRO AI is temporarily unavailable. Please try again.'
      setMessages(prev => prev.filter(m => m.id !== tId))
      addAIMessage(reply)
    } catch {
      setMessages(prev => prev.filter(m => m.id !== tId))
      addAIMessage('MONTRO AI is temporarily unavailable. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([])
    setChipsSent(false)
    welcomeShown.current = false
    setTimeout(() => addAIMessage(WELCOME), 60)
  }

  const onKey = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }

  // ── Panel open/close animation ────────────────────────────────────────────
  const panelStyle = {
    position: 'fixed', bottom: 84, right: 24, width: 380, height: 520,
    background: 'rgba(4,12,28,0.92)', backdropFilter: 'blur(32px)',
    border: '1px solid rgba(0,242,255,0.18)', borderRadius: 18,
    boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 40px rgba(0,242,255,0.08)',
    display: 'flex', flexDirection: 'column', zIndex: 9999,
    transformOrigin: 'bottom right',
    transition: 'transform 0.25s cubic-bezier(.2,.8,.2,1), opacity 0.25s ease',
    ...(open
      ? { transform: 'scale(1)', opacity: 1, pointerEvents: 'all' }
      : { transform: 'scale(0.88)', opacity: 0, pointerEvents: 'none' }),
  }

  return (
    <>
      {/* ── Keyframes injected once ── */}
      <style>{`
        @keyframes dot-pulse {
          0%,100% { transform: scale(1); opacity: 0.5; }
          50%      { transform: scale(1.4); opacity: 1; }
        }
        @keyframes ai-btn-pulse {
          0%   { box-shadow: 0 0 0 0 rgba(0,242,255,0.55), 0 0 24px rgba(0,242,255,0.4); }
          70%  { box-shadow: 0 0 0 12px rgba(0,242,255,0), 0 0 24px rgba(0,242,255,0.4); }
          100% { box-shadow: 0 0 0 0 rgba(0,242,255,0), 0 0 24px rgba(0,242,255,0.4); }
        }
      `}</style>

      {/* ── Chat panel ── */}
      <div style={panelStyle}>

        {/* Header */}
        <div style={{
          height: 56, flexShrink: 0, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 18px',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%', background: 'var(--cyan)',
              animation: 'pulse-ring 2s infinite', flexShrink: 0,
            }} />
            <div>
              <div style={{
                fontFamily: 'var(--font-brand)', fontSize: 13, color: 'var(--cyan)',
                textShadow: '0 0 10px rgba(0,242,255,0.4)', letterSpacing: 1.5,
              }}>MONTRO AI</div>
              <div style={{ fontSize: 9, letterSpacing: 2, color: 'var(--text)', textTransform: 'uppercase', marginTop: 2 }}>
                Quantitative Analyst
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span
              onClick={clearChat}
              style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: 1.5, color: 'var(--text)', cursor: 'pointer', textTransform: 'uppercase', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = 'var(--cyan)'}
              onMouseLeave={e => e.target.style.color = 'var(--text)'}
            >CLEAR</span>
            <span
              onClick={() => setOpen(false)}
              style={{ fontSize: 18, color: 'var(--text)', cursor: 'pointer', lineHeight: 1, transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = 'var(--cyan)'}
              onMouseLeave={e => e.target.style.color = 'var(--text)'}
            >×</span>
          </div>
        </div>

        {/* Messages area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          {messages.map(m => <Bubble key={m.id} msg={m} />)}

          {/* Suggested chips */}
          {!chipsSent && messages.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4, marginBottom: 8 }}>
              {CHIPS.map(c => (
                <button key={c} onClick={() => handleSend(c)} style={{
                  padding: '5px 12px', borderRadius: 20, fontSize: 11,
                  background: 'rgba(0,242,255,0.06)', border: '1px solid rgba(0,242,255,0.3)',
                  color: 'var(--cyan)', cursor: 'pointer', fontFamily: 'var(--font-body)',
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,242,255,0.14)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,242,255,0.06)'}
                >{c}</button>
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div style={{
          height: 56, flexShrink: 0, display: 'flex', alignItems: 'center',
          padding: '0 14px', gap: 10, borderTop: '1px solid var(--border)',
        }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKey}
            disabled={loading}
            placeholder="Ask MONTRO AI anything..."
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--text-bright)',
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            style={{
              width: 34, height: 34, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, var(--blue), var(--cyan))',
              color: '#fff', fontSize: 16, display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0,
              boxShadow: '0 0 12px rgba(0,242,255,0.3)',
              opacity: (!input.trim() || loading) ? 0.4 : 1,
              transition: 'opacity 0.2s, box-shadow 0.2s',
            }}
          >→</button>
        </div>
      </div>

      {/* ── Floating trigger button ── */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
        {tooltip && (
          <div style={{
            position: 'absolute', bottom: '110%', left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(4,12,28,0.9)', border: '1px solid var(--border)',
            borderRadius: 6, padding: '4px 10px', whiteSpace: 'nowrap',
            fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 1.5,
            color: 'var(--cyan)', pointerEvents: 'none',
          }}>MONTRO AI</div>
        )}
        <button
          onClick={() => setOpen(o => !o)}
          onMouseEnter={(e) => { setTooltip(true); e.currentTarget.style.transform = 'scale(1.08)' }}
          onMouseLeave={(e) => { setTooltip(false); e.currentTarget.style.transform = 'scale(1)' }}
          style={{
            width: 52, height: 52, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, var(--blue), var(--cyan))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'ai-btn-pulse 2.5s ease-out infinite',
            transition: 'transform 0.2s',
          }}
        >
          <span style={{ color: '#fff', fontSize: 20, lineHeight: 1 }}>◎</span>
        </button>
      </div>
    </>
  )
}
