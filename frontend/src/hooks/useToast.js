import { useState, useCallback } from 'react'

// 🧠 A custom hook is just a function that starts with "use"
// and uses React hooks inside it. It lets you reuse stateful logic.
function useToast() {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    // Auto-remove after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  return { toasts, showToast }
}

export default useToast