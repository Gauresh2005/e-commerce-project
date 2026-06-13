import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'

function ProductCard({ product }) {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()
  const { addToCart } = useCart()
  const { showToast } = useToast()

  const handleAddToCart = async (e) => {
    e.stopPropagation()

    if (!isLoggedIn) {
      showToast('Please login to add items to cart', 'error')
      navigate('/login')
      return
    }

    if (product.stock === 0) {
      showToast('This product is out of stock', 'error')
      return
    }

    const result = await addToCart(product.id, 1)
    if (result.success) {
      showToast(`${product.name} added to cart!`, 'success')
    } else {
      showToast(result.message || 'Failed to add to cart', 'error')
    }
  }

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      style={{
        background: 'var(--card)',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow)',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = 'var(--shadow)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'var(--shadow)'
      }}
    >
      {/* Product image or placeholder */}
      {product.image ? (
        <img
          src={`http://localhost:3000${product.image}`}
          alt={product.name}
          style={{ width: '100%', height: '200px', objectFit: 'cover' }}
        />
      ) : (
        <div style={{
          width: '100%', height: '200px',
          background: 'linear-gradient(135deg, #e0ddff, #ffd6e0)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '1rem', color: 'var(--muted)'
        }}>
          No Image
        </div>
      )}

      {/* Product info */}
      <div style={{ padding: '1rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '0.4rem' }}>
          {product.name}
        </h3>
        <div style={{ color: 'var(--primary)', fontSize: '1.15rem', fontWeight: 700 }}>
          ₹{Number(product.price).toLocaleString('en-IN')}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
          {product.stock > 0
            ? `${product.stock} in stock`
            : <span style={{ color: 'var(--danger)' }}>Out of stock</span>
          }
        </div>
      </div>

      {/* Add to cart button */}
      <div style={{
        padding: '0.75rem 1rem',
        borderTop: '1px solid var(--border)',
      }}>
        <button
          className="btn btn-primary btn-sm"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={handleAddToCart}
          disabled={product.stock === 0}
        >
          Add to Cart
        </button>
      </div>
    </div>
  )
}

export default ProductCard