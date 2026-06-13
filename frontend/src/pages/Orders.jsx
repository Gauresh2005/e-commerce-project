import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import Modal from '../components/Modal'
import OrderDetail from '../components/OrderDetail'
import Spinner from '../components/Spinner'
import api from '../api'

function StatusBadge({ status }) {
  const styles = {
    pending:    { bg: '#fff3cd', color: '#856404' },
    processing: { bg: '#cce5ff', color: '#004085' },
    delivered:  { bg: '#d4edda', color: '#155724' },
    cancelled:  { bg: '#f8d7da', color: '#721c24' },
  }
  const s = styles[status] || styles.pending
  return (
    <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', background: s.bg, color: s.color }}>{status}</span>
  )
}

function Orders() {
  const { showToast } = useToast()
  const [orders, setOrders]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [selectedOrderId, setSelectedOrderId] = useState(null)

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await api.getMyOrders()
        setOrders(data.orders || [])
      } catch {
        showToast('Failed to load orders', 'error')
      } finally {
        setLoading(false)
      }
    }
    loadOrders()
  }, [])

  const formatDate = (str) => new Date(str).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  if (loading) return <Spinner />

  if (orders.length === 0) {
    return (
      <div className="container">
        <div className="empty-state">
          <div className="icon">No orders</div>
          <p>You haven't placed any orders yet</p>
          <Link to="/" className="btn btn-primary">Start Shopping</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>My Orders</h1>
        <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td><strong>#{order.id}</strong></td>
                <td style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{formatDate(order.created_at)}</td>
                <td>{order.total_items} item{order.total_items !== 1 ? 's' : ''}</td>
                <td><strong>₹{Number(order.total_amount).toLocaleString('en-IN')}</strong></td>
                <td><StatusBadge status={order.status} /></td>
                <td><button className="btn btn-outline btn-sm" onClick={() => setSelectedOrderId(order.id)}>View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
        {[
          { label: 'Total Orders', value: orders.length, icon: '' },
          { label: 'Total Spent', value: `₹${orders.reduce((s, o) => s + Number(o.total_amount), 0).toLocaleString('en-IN')}`, icon: '' },
          { label: 'Delivered', value: orders.filter(o => o.status === 'delivered').length, icon: '' },
          { label: 'Pending', value: orders.filter(o => o.status === 'pending').length, icon: '' },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ padding: '1.2rem', textAlign: 'center' }}>
            {stat.icon && <div style={{ fontSize: '1.8rem', marginBottom: '0.3rem' }}>{stat.icon}</div>}
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary)' }}>{stat.value}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.2rem' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <Modal isOpen={selectedOrderId !== null} onClose={() => setSelectedOrderId(null)} title={selectedOrderId ? `Order #${selectedOrderId}` : ''}>
        {selectedOrderId && <OrderDetail orderId={selectedOrderId} />}
      </Modal>
    </div>
  )
}

export default Orders