import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'

function CartItem({ item }) {
  const { updateItem, removeItem } = useCart()
  const { showToast } = useToast()

  // Vite exposes env through import.meta.env; fallback to localhost
  const baseUrl = (import.meta && import.meta.env && import.meta.env.VITE_API_URL)
    ? import.meta.env.VITE_API_URL
    : (typeof window !== 'undefined' && window.__API_URL) ? window.__API_URL : 'http://localhost:3000'

  const imageSrc = item.image
    ? (item.image.startsWith('http') ? item.image : `${baseUrl}${item.image.startsWith('/') ? item.image : '/' + item.image}`)
    : null

  const [qty, setQty]           = useState(item.quantity)
  const [updating, setUpdating] = useState(false)
  const [removing, setRemoving] = useState(false)

  const handleDecrease = async () => {
    if (qty <= 1) {
      handleRemove()
      return
    }
    const newQty = qty - 1
    setQty(newQty)
    setUpdating(true)
    await updateItem(item.product_id, newQty)
    setUpdating(false)
  }

  const handleIncrease = async () => {
    if (qty >= item.stock) {
      showToast('No more stock available', 'error')
      return
    }
    const newQty = qty + 1
    setQty(newQty)
    setUpdating(true)
    await updateItem(item.product_id, newQty)
    setUpdating(false)
  }

  const handleRemove = async () => {
    setRemoving(true)
    await removeItem(item.product_id)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderBottom: '1px solid var(--border)', opacity: removing ? 0.4 : 1, transition: 'opacity 0.3s' }}>
      {imageSrc ? (
        <img src={imageSrc} alt={item.name} style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
      ) : (
        <div style={{ width: '72px', height: '72px', flexShrink: 0, borderRadius: '8px', background: 'var(--placeholder-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', color: 'var(--muted)' }}>No Image</div>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <h4 style={{ marginBottom: '0.2rem', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h4>
        <div style={{ color: 'var(--primary)', fontWeight: 700 }}>₹{Number(item.price).toLocaleString('en-IN')}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.2rem' }}>Subtotal: ₹{(Number(item.price) * qty).toLocaleString('en-IN')}</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button onClick={handleDecrease} disabled={updating || removing} style={{ width: '30px', height: '30px', border: '2px solid var(--border)', borderRadius: '6px', background: 'var(--card)', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
        <span style={{ minWidth: '28px', textAlign: 'center', fontWeight: 700, fontSize: '1rem', opacity: updating ? 0.5 : 1 }}>{qty}</span>
        <button onClick={handleIncrease} disabled={updating || removing || qty >= item.stock} style={{ width: '30px', height: '30px', border: '2px solid var(--border)', borderRadius: '6px', background: 'var(--card)', cursor: qty >= item.stock ? 'not-allowed' : 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
      </div>

      <button onClick={handleRemove} disabled={removing} className="btn btn-danger btn-sm" style={{ flexShrink: 0 }}>{removing ? '...' : 'Remove'}</button>
    </div>
  )
}

export default CartItem