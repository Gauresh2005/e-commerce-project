function Toast({ toasts }) {
  if (toasts.length === 0) return null

  return (
    <div style={{
      position: 'fixed', bottom: '1.5rem', right: '1.5rem',
      display: 'flex', flexDirection: 'column', gap: '0.5rem',
      zIndex: 9999
    }}>
      {toasts.map(toast => (
        <div
          key={toast.id}
          style={{
            padding: '0.85rem 1.4rem',
            borderRadius: '10px',
            color: 'white',
            fontWeight: 600,
            fontSize: '0.9rem',
            boxShadow: 'var(--shadow)',
            animation: 'slideIn 0.3s ease',
            maxWidth: '320px',
            background:
              toast.type === 'success' ? 'var(--success)' :
              toast.type === 'error'   ? 'var(--danger)'  :
                                         'var(--primary)',
          }}
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}

export default Toast