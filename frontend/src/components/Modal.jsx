import { useEffect } from 'react'

// 🧠 Props:
// isOpen    — controls visibility
// onClose   — called when user clicks backdrop or X button
// title     — shown in the modal header
// children  — whatever you put between <Modal>...</Modal> tags
function Modal({ isOpen, onClose, title, children }) {

  // 🧠 Lock body scroll when modal is open
  // This prevents the background page from scrolling behind the modal
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    // 🧠 Cleanup function — runs when component unmounts or isOpen changes
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // 🧠 Close on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    if (isOpen) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  // Don't render anything if closed
  if (!isOpen) return null

  return (
    // 🧠 Backdrop — clicking the dark area closes the modal
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'var(--overlay)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        animation: 'fadeIn 0.2s ease',
        padding: '1rem',
      }}
    >
      {/* 🧠 stopPropagation — clicking inside modal
          doesn't bubble up to the backdrop's onClick */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--card)',
          borderRadius: 'var(--radius)',
          padding: '2rem',
          width: '100%', maxWidth: '500px',
          maxHeight: '90vh', overflowY: 'auto',
          animation: 'slideUp 0.2s ease',
          boxShadow: 'var(--shadow)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '1.5rem',
        }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none',
              fontSize: '1.5rem', cursor: 'pointer',
              color: 'var(--muted)', lineHeight: 1,
              padding: '0.2rem 0.4rem', borderRadius: '4px',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            Close
          </button>
        </div>

        {/* Content — whatever is passed as children */}
        {children}
      </div>
    </div>
  )
}

export default Modal