import { useState, useEffect, useMemo } from 'react'
import ProductCard from '../components/ProductCard'
import Spinner from '../components/Spinner'
import api from '../api'

function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await api.getProducts()
        setProducts(data.products || [])
      } catch (err) {
        console.error('Product fetch error:', err);
        setError(err.message || 'Failed to load products. Is your backend running?')
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return products
    return products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q)
    )
  }, [products, search])

  if (loading) return <Spinner />

  if (error) return (
    <div className="container">
      <div className="empty-state">
        <div className="icon">Error</div>
        <p>{error}</p>
      </div>
    </div>
  )

  return (
    <div className="container">
      <div className="page-header">
        <h1>All Products</h1>
        <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
          {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, padding: '0.75rem 1.2rem',
            border: '2px solid var(--border)', borderRadius: '8px',
            fontSize: '0.95rem', outline: 'none',
            transition: 'border 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--primary)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
        {search && (
          <button className="btn btn-outline" onClick={() => setSearch('')}>Clear</button>
        )}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="empty-state">
          <div className="icon">No results</div>
          <p>
            {search
              ? `No products matching "${search}"`
              : 'No products available yet'
            }
          </p>
          {search && (
            <button className="btn btn-primary" onClick={() => setSearch('')}>Clear Search</button>
          )}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '1.5rem',
        }}>
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Products