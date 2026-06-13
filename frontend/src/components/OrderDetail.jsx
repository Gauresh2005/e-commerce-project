import { useState, useEffect } from 'react'
import Spinner from './Spinner'
import api from '../api'

// 🧠 This component fetches its own data when mounted
// The parent (Orders page) just passes the orderId
function OrderDetail({ orderId }) {
  const [order, setOrder]   = useState(null)
  const [items, setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const data = await api.getOrder(orderId)
        setOrder(data.order)
        setItems(data.items || [])
      } catch {
        setError('Failed to load order details')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [orderId])

  if (loading) return <Spinner />
  if (error)   return <p style={{ color: 'var(--danger)' }}>{error}</p>
  if (!order)  return null

  const statusColors = {
    pending:    { bg: 'var(--status-pending-bg)', color: 'var(--status-pending-color)' },
    processing: { bg: 'var(--status-processing-bg)', color: 'var(--status-processing-color)' },
    delivered:  { bg: 'var(--status-delivered-bg)', color: 'var(--status-delivered-color)' },
    cancelled:  { bg: 'var(--status-cancelled-bg)', color: 'var(--status-cancelled-color)' },
  }

  const sc = statusColors[order.status] || statusColors.pending

  return (
    <div>
      {/* Order meta */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: '0.75rem', marginBottom: '1.5rem',
      }}>
        <div style={{ background: 'var(--bg)', padding: '0.75rem', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.2rem' }}>
            ORDER ID
          </div>
          <div style={{ fontWeight: 700 }}>#{order.id}</div>
        </div>

        <div style={{ background: 'var(--bg)', padding: '0.75rem', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.2rem' }}>
            STATUS
          </div>
          <span style={{
            display: 'inline-block',
            padding: '0.2rem 0.6rem', borderRadius: '20px',
            fontSize: '0.78rem', fontWeight: 700,
            background: sc.bg, color: sc.color,
            textTransform: 'uppercase',
          }}>
            {order.status}
          </span>
        </div>

        <div style={{ background: 'var(--bg)', padding: '0.75rem', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.2rem' }}>
            DATE
          </div>
          <div style={{ fontWeight: 600 }}>
            {new Date(order.created_at).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric'
            })}
          </div>
        </div>

        <div style={{ background: 'var(--bg)', padding: '0.75rem', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.2rem' }}>
            TOTAL
          </div>
          <div style={{ fontWeight: 700, color: 'var(--primary)' }}>
            ₹{Number(order.total_amount).toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Items list */}
      <h4 style={{ marginBottom: '0.75rem', color: 'var(--primary)' }}>
        Items Ordered
      </h4>

      <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
        {items.map((item, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.85rem 1rem',
              borderBottom: index < items.length - 1 ? '1px solid var(--border)' : 'none',
              // 🧠 Alternate row background for readability
              background: index % 2 === 0 ? 'var(--card)' : 'var(--bg)',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                {item.name}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.15rem' }}>
                {item.quantity} × ₹{Number(item.price).toLocaleString('en-IN')}
              </div>
            </div>
            <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.95rem' }}>
              ₹{Number(item.subtotal).toLocaleString('en-IN')}
            </div>
          </div>
        ))}
      </div>

      {/* Total footer */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        padding: '1rem', fontWeight: 700, fontSize: '1.05rem',
        borderTop: '2px solid var(--border)', marginTop: '0.5rem',
      }}>
        <span>Total</span>
        <span style={{ color: 'var(--primary)' }}>
          ₹{Number(order.total_amount).toLocaleString('en-IN')}
        </span>
      </div>
    </div>
  )
}

export default OrderDetail