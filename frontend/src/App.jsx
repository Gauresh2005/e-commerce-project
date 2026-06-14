import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/NavBar'
import Products from './pages/Products'
import Login from './pages/Login'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Orders from './pages/Orders'
import Admin from './pages/Admin'

// 🧠 ProtectedRoute is its own component now — clean and reusable
function ProtectedRoute({ children, adminOnly = false }) {
  const { user, authLoading, isAdmin } = useAuth()
  if (authLoading) return null
  if (!user) return <Navigate to="/login" />
  if (adminOnly && !isAdmin) return <Navigate to="/" />
  return children
}

function App() {
  const { authLoading } = useAuth()

  // Don't render anything until we know if user is logged in
  if (authLoading) return null

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"           element={<Products />} />
        <Route path="/login"      element={<Login />} />
        <Route path="/product/:id" element={<ProductDetail />} />

        <Route path="/cart" element={
          <ProtectedRoute><Cart /></ProtectedRoute>
        } />

        <Route path="/orders" element={
          <ProtectedRoute><Orders /></ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute adminOnly><Admin /></ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App