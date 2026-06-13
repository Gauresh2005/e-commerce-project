import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import api from '../api'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { isLoggedIn } = useAuth()
  const [cartCount, setCartCount] = useState(0)
  const [cartItems, setCartItems] = useState([])
  const [cartTotal, setCartTotal] = useState('0')
  const [cartLoading, setCartLoading] = useState(false)

  // 🧠 useCallback — memoizes a function so it doesn't get
  // recreated on every render. Important when passing functions
  // to useEffect's dependency array.
  const refreshCart = useCallback(async () => {
    if (!isLoggedIn) {
      setCartCount(0)
      setCartItems([])
      setCartTotal('0')
      return
    }
    try {
      setCartLoading(true)
      // Add a timeout to avoid spinner getting stuck if network hangs
      const timeoutMs = 8000
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Cart request timed out')), timeoutMs))
      const data = await Promise.race([api.getCart(), timeoutPromise])
      // Defensive checks
      if (!data || typeof data !== 'object') throw new Error('Invalid cart data')
      setCartItems(data.items || [])
      setCartTotal(data.total || '0')
      setCartCount(data.items ? data.items.length : 0)
    } catch (err) {
      console.error('refreshCart error:', err && err.message ? err.message : err)
      setCartCount(0)
      setCartItems([])
      setCartTotal('0')
    } finally {
      setCartLoading(false)
    }
  }, [isLoggedIn])

  // Refresh cart whenever login state changes
  // 🧠 [refreshCart] in the dependency array means:
  // "re-run this effect whenever refreshCart changes"
  useEffect(() => {
    refreshCart()
  }, [refreshCart])

  const addToCart = async (productId, quantity = 1) => {
    const res = await api.addToCart(productId, quantity)
    if (res.message && res.success !== false) {
      await refreshCart()
      return { success: true }
    }
    return { success: false, message: res.message }
  }

  const updateItem = async (productId, quantity) => {
    await api.updateCartItem(productId, quantity)
    await refreshCart()
  }

  const removeItem = async (productId) => {
    await api.removeCartItem(productId)
    await refreshCart()
  }

  const clearCart = async () => {
    await api.clearCart()
    await refreshCart()
  }

  const value = {
    cartCount,
    cartItems,
    cartTotal,
    cartLoading,
    refreshCart,
    addToCart,
    updateItem,
    removeItem,
    clearCart,
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used inside CartProvider')
  }
  return context
}