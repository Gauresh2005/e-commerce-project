import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, showToast }}>
      {children}

      {/* Toast UI renders here — available on every page automatically */}
      {toasts.length > 0 && (
        <div style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem',
          display: 'flex', flexDirection: 'column', gap: '0.5rem',
          zIndex: 9999,
        }}>
          {toasts.map(toast => (
            <div key={toast.id} style={{
              padding: '0.85rem 1.4rem',
              borderRadius: '10px',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.9rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
              animation: 'slideIn 0.3s ease',
              maxWidth: '320px',
              background:
                toast.type === 'success' ? 'var(--success)' :
                toast.type === 'error'   ? 'var(--danger)'  :
                                           'var(--primary)',
            }}>
              {toast.message}
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside ToastProvider')
  return context
}