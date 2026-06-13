import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import CartItem from '../components/CartItem'
import Spinner from '../components/Spinner'
import api from '../api'

function Cart() {
  const { cartItems, cartTotal, cartLoading, clearCart, refreshCart } = useCart()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [placingOrder, setPlacingOrder] = useState(false)
  const [clearing, setClearing]         = useState(false)

  const handlePlaceOrder = async () => {
    setPlacingOrder(true)
    try {
      const res = await api.placeOrder()
      if (res.orderId) {
        await refreshCart()
        showToast(`Order #${res.orderId} placed successfully!`, 'success')
        navigate('/orders')
      } else {
        showToast(res.message || 'Failed to place order', 'error')
      }
    } catch {
      showToast('Something went wrong', 'error')
    } finally {
      setPlacingOrder(false)
    }
  }

  const handleClearCart = async () => {
    if (!window.confirm('Clear your entire cart?')) return
    setClearing(true)
    await clearCart()
    setClearing(false)
    showToast('Cart cleared', 'info')
  }

  if (cartLoading) return <Spinner />

  if (cartItems.length === 0) {
    return (
      <div className="container">
        <div className="empty-state">
          <div className="icon">Cart</div>
          <p>Your cart is empty</p>
          <Link to="/" className="btn btn-primary">Start Shopping</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>My Cart</h1>
        <button className="btn btn-danger btn-sm" onClick={handleClearCart} disabled={clearing}>
          {clearing ? 'Clearing...' : 'Clear Cart'}
        </button>
      </div>

      <div className='cart-two-col' style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '2rem', alignItems: 'start' }}>
        <div className="card">
          {cartItems.map(item => (
            <CartItem key={item.product_id} item={item} />
          ))}
        </div>

        <div className="card" style={{ padding: '1.5rem', position: 'sticky', top: '80px' }}>
          <h3 style={{ marginBottom: '1.2rem', fontSize: '1.1rem' }}>Order Summary</h3>

          <div style={{ marginBottom: '0.8rem' }}>
            {cartItems.map(item => (
              <div key={item.product_id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.4rem' }}>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>{item.name} × {item.quantity}</span>
                <span>₹{Number(item.subtotal).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.8rem', marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem' }}>
              <span>Total</span>
              <span style={{ color: 'var(--primary)' }}>₹{Number(cartTotal).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {Number(cartTotal) < 999 && (
            <p style={{ fontSize: '0.78rem', color: 'var(--warning)', marginTop: '0.75rem', textAlign: 'center', background: 'var(--warning-bg)', padding: '0.5rem', borderRadius: '6px' }}>
              Add ₹{(999 - Number(cartTotal)).toLocaleString('en-IN')} more for free delivery
            </p>
          )}

          {Number(cartTotal) >= 999 && (
            <p style={{ fontSize: '0.78rem', color: 'var(--success)', marginTop: '0.75rem', textAlign: 'center', background: 'var(--success-bg)', padding: '0.5rem', borderRadius: '6px' }}>
              You qualify for free delivery!
            </p>
          )}

          <button className="btn btn-success" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', padding: '0.75rem' }} onClick={handlePlaceOrder} disabled={placingOrder}>
            {placingOrder ? 'Placing Order...' : 'Place Order'}
          </button>

          <Link to="/" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', marginTop: '0.75rem', display: 'flex' }}>Continue Shopping</Link>
        </div>
      </div>
    </div>
  )
}

export default Cart