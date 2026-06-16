import { useState, useEffect, useCallback } from 'react'
import { useToast } from '../context/ToastContext'
import Modal from '../components/Modal'
import ProductForm from '../components/ProductForm'
import Spinner from '../components/Spinner'
import api from '../api'

function StatusBadge({ status }) {
  const styles = { pending: { bg: '#fff3cd', color: '#856404' }, processing: { bg: '#cce5ff', color: '#004085' }, delivered: { bg: '#d4edda', color: '#155724' }, cancelled: { bg: '#f8d7da', color: '#721c24' } }
  const s = styles[status] || styles.pending
  return <span style={{ padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', background: s.bg, color: s.color }}>{status}</span>
}

function Admin() {
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState('products')
  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [updatingOrder, setUpdatingOrder] = useState(null)

  const loadProducts = useCallback(async () => { try { setProductsLoading(true); const data = await api.getProducts(); setProducts(data.products || []) } catch { showToast('Failed to load products', 'error') } finally { setProductsLoading(false) } }, [])
  const loadOrders = useCallback(async () => { try { setOrdersLoading(true); const data = await api.getAllOrders(); setOrders(data.orders || []) } catch { showToast('Failed to load orders', 'error') } finally { setOrdersLoading(false) } }, [])

  useEffect(() => { loadProducts() }, [loadProducts])
  useEffect(() => { if (activeTab === 'orders' && orders.length === 0) loadOrders() }, [activeTab])

  const openCreateModal = () => { setEditingProduct(null); setModalOpen(true) }
  const openEditModal = (product) => { setEditingProduct(product); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditingProduct(null) }
  const handleFormSuccess = () => { closeModal(); loadProducts() }

  const handleDelete = async (product) => { if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return; const res = await api.deleteProduct(product.id); if (res.message) { showToast('Product deleted', 'info'); loadProducts() } else { showToast('Failed to delete product', 'error') } }
  const handleStatusChange = async (orderId, status) => { setUpdatingOrder(orderId); const res = await api.updateOrderStatus(orderId, status); setUpdatingOrder(null); if (res.message) { showToast(`Order #${orderId} updated to ${status}`, 'success'); setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o)) } else { showToast('Failed to update status', 'error') } }

  const stats = [ { icon: '', label: 'Total Products', value: products.length }, { icon: '', label: 'Total Orders', value: orders.length || '—' }, { icon: '', label: 'Total Revenue', value: orders.length ? `₹${orders.reduce((s, o) => s + Number(o.total_amount), 0).toLocaleString('en-IN')}` : '—' }, { icon: '', label: 'Pending Orders', value: orders.length ? orders.filter(o => o.status === 'pending').length : '—' } ]
  const formatDate = (str) => new Date(str).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="container">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <button className="btn btn-primary" onClick={openCreateModal}>Add Product</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {stats.map(stat => (
          <div key={stat.label} className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            {stat.icon && <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>{stat.icon}</div>}
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>{stat.value}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.3rem' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', borderBottom: '2px solid var(--border)', marginBottom: '1.5rem' }}>
        {['products', 'orders'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '0.75rem 1.5rem', background: 'none', border: 'none', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', color: activeTab === tab ? 'var(--primary)' : 'var(--muted)', borderBottom: activeTab === tab ? '3px solid var(--primary)' : '3px solid transparent', marginBottom: '-2px', transition: 'all 0.2s', textTransform: 'capitalize' }}>{tab === 'products' ? `Products (${products.length})` : 'Orders'}</button>
        ))}
      </div>

      {activeTab === 'products' && (productsLoading ? <Spinner /> : (products.length === 0 ? (<div className="empty-state"><div className="icon">Products</div><p>No products yet</p><button className="btn btn-primary" onClick={openCreateModal}>Add your first product</button></div>) : (<div className="card table-wrap"><table><thead><tr><th>ID</th><th>Image</th><th>Name</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead><tbody>{products.map(product => (<tr key={product.id}><td style={{ color: 'var(--muted)' }}>#{product.id}</td><td>{product.image ? (<img src={`${import.meta.env.VITE_API_URL}${product.image}`} alt={product.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }} />) : (<div style={{ width: '48px', height: '48px', borderRadius: '6px', background: 'var(--placeholder-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', color: 'var(--muted)' }}>No Image</div>)}</td><td><strong>{product.name}</strong></td><td>₹{Number(product.price).toLocaleString('en-IN')}</td><td><span style={{ color: product.stock === 0 ? 'var(--danger)' : product.stock < 5 ? 'var(--warning)' : 'var(--success)', fontWeight: 600 }}>{product.stock === 0 ? 'Out of stock' : product.stock}</span></td><td><div style={{ display: 'flex', gap: '0.5rem' }}><button className="btn btn-outline btn-sm" onClick={() => openEditModal(product)}>Edit</button><button className="btn btn-danger btn-sm" onClick={() => handleDelete(product)}>Delete</button></div></td></tr>))}</tbody></table></div>)))}

      {activeTab === 'orders' && (ordersLoading ? <Spinner /> : (orders.length === 0 ? (<div className="empty-state"><div className="icon">Orders</div><p>No orders yet</p></div>) : (<div className="card table-wrap"><table><thead><tr><th>ID</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th><th>Update Status</th></tr></thead><tbody>{orders.map(order => (<tr key={order.id}><td><strong>#{order.id}</strong></td><td><div style={{ fontWeight: 600 }}>{order.customer_name}</div><div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{order.customer_email}</div></td><td><strong>₹{Number(order.total_amount).toLocaleString('en-IN')}</strong></td><td><StatusBadge status={order.status} /></td><td style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{formatDate(order.created_at)}</td><td><select value={order.status} onChange={e => handleStatusChange(order.id, e.target.value)} disabled={updatingOrder === order.id} style={{ padding: '0.4rem 0.6rem', border: '2px solid var(--border)', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', outline: 'none', opacity: updatingOrder === order.id ? 0.5 : 1 }} onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'}>{['pending', 'processing', 'delivered', 'cancelled'].map(s => (<option key={s} value={s}>{s}</option>))}</select>{updatingOrder === order.id && (<span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginLeft: '0.5rem' }}>Saving...</span>)}</td></tr>))}</tbody></table></div>)))}

      <Modal isOpen={modalOpen} onClose={closeModal} title={editingProduct ? `Edit: ${editingProduct.name}` : 'Add New Product'}>
        <ProductForm product={editingProduct} onSuccess={handleFormSuccess} onCancel={closeModal} />
      </Modal>
    </div>
  )
}

export default Admin