import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import Spinner from '../components/Spinner'
import api from '../api'

function ProductDetail() {
  const { id } = useParams()
  const navigate  = useNavigate()
  const { isLoggedIn } = useAuth()
  const { addToCart }  = useCart()
  const { showToast }  = useToast()

  const [product, setProduct]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding]     = useState(false)

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true)
      setNotFound(false)

      try {
        const data = await api.getProduct(id)
        if (!data.product) {
          setNotFound(true)
          return
        }
        setProduct(data.product)
        setQuantity(1)
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [id])

  const decrease = () => setQuantity(q => Math.max(1, q - 1))
  const increase = () => setQuantity(q => Math.min(product.stock, q + 1))
  const handleQtyInput = (e) => {
    const val = parseInt(e.target.value)
    if (isNaN(val)) { setQuantity(1); return }
    setQuantity(Math.min(product.stock, Math.max(1, val)))
  }

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      showToast('Please login to add items to cart', 'error')
      navigate('/login')
      return
    }

    setAdding(true)
    const result = await addToCart(product.id, quantity)
    setAdding(false)

    if (result.success) {
      showToast(`${product.name} × ${quantity} added to cart!`, 'success')
    } else {
      showToast(result.message || 'Failed to add to cart', 'error')
    }
  }

  if (loading) return <Spinner />

  if (notFound) return (
    <div className="container">
      <div className="empty-state">
        <div className="icon">Not found</div>
        <p>Product not found</p>
        <Link to="/" className="btn btn-primary">Back to Products</Link>
      </div>
    </div>
  )

  const outOfStock = product.stock === 0

  return (
    <div className="container">
      <div style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--muted)' }}>
        <Link to="/" style={{ color: 'var(--primary)', fontWeight: 600 }}>
          Home
        </Link>
        {' / '}
        <span>{product.name}</span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '3rem',
        alignItems: 'start',
      }}>
        <div>
          {product.image ? (
            <img
              src={`${import.meta.env.VITE_API_URL}${product.image}`}
              alt={product.name}
              style={{
                width: '100%',
                borderRadius: 'var(--radius)',
                maxHeight: '420px',
                objectFit: 'cover',
                boxShadow: 'var(--shadow)',
              }}
            />
          ) : (
            <div style={{
              width: '100%', height: '350px',
              background: 'linear-gradient(135deg, #e0ddff, #ffd6e0)',
              borderRadius: 'var(--radius)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '2rem', color: 'var(--muted)'
            }}>
              No Image
            </div>
          )}
        </div>

        <div>
          <h1 style={{ fontSize: '1.9rem', marginBottom: '0.5rem' }}>
            {product.name}
          </h1>

          <div style={{ fontSize: '2rem', color: 'var(--primary)', fontWeight: 700, margin: '1rem 0' }}>
            ₹{Number(product.price).toLocaleString('en-IN')}
          </div>

          {product.description && (
            <p style={{ color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              {product.description}
            </p>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            {outOfStock ? (
              <span style={{ color: 'var(--danger)', fontWeight: 700 }}>Out of Stock</span>
            ) : (
              <span style={{ color: 'var(--success)', fontWeight: 700 }}>In Stock
                <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: '0.9rem' }}> ({product.stock} available)</span>
              </span>
            )}
          </div>

          {!outOfStock && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <span style={{ fontWeight: 600 }}>Quantity:</span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button onClick={decrease} disabled={quantity <= 1} style={{ width: '34px', height: '34px', border: '2px solid var(--border)', borderRadius: '8px', background: 'var(--card)' }}>
                  −
                </button>

                <input type="number" value={quantity} onChange={handleQtyInput} min={1} max={product.stock} style={{ width: '60px', padding: '0.4rem', border: '2px solid var(--border)', borderRadius: '8px', textAlign: 'center' }} />

                <button onClick={increase} disabled={quantity >= product.stock} style={{ width: '34px', height: '34px', border: '2px solid var(--border)', borderRadius: '8px', background: 'var(--card)' }}>
                  +
                </button>
              </div>

              <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>= ₹{(Number(product.price) * quantity).toLocaleString('en-IN')}</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {outOfStock ? (
              <button className="btn btn-primary" disabled>Out of Stock</button>
            ) : (
              <button className="btn btn-primary" onClick={handleAddToCart} disabled={adding} style={{ minWidth: '160px' }}>{adding ? 'Adding...' : 'Add to Cart'}</button>
            )}

            <Link to="/" className="btn btn-outline">Continue Shopping</Link>
          </div>

          <div style={{ marginTop: '2rem', padding: '1rem 1.2rem', background: 'var(--bg)', borderRadius: 'var(--radius)', fontSize: '0.85rem', color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div>Free delivery on orders above ₹999</div>
            <div>Easy 7-day returns</div>
            <div>Secure checkout</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail