import { createContext, useContext, useState, useEffect } from 'react'

// 🧠 createContext() creates the "store"
// Think of it like creating an empty box that will hold your data
const AuthContext = createContext(null)

// 🧠 The Provider component wraps your app and fills that box with data
// Any component inside the Provider can read from it
export function AuthProvider({ children }) {
  const [user, setUser]           = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  // On app load, check if user is already logged in
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    }
    setAuthLoading(false)
  }, [])

  const login = (token, userData) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  // 🧠 Everything inside "value" is what components can access
  const value = {
    user,           // the logged-in user object (or null)
    authLoading,    // true while checking localStorage
    login,          // call this to log in
    logout,         // call this to log out
    isAdmin: user?.role === 'admin',  // shortcut boolean
    isLoggedIn: !!user,               // shortcut boolean
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// 🧠 Custom hook — instead of importing both useContext AND AuthContext
// in every file, you just import useAuth() — cleaner!
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}