import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import api from '../api'

function Login() {
  const { login, isLoggedIn, isAdmin } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  // 🧠 One state value controls which tab is active
  const [activeTab, setActiveTab] = useState('login')

  // ── Login form state ───────────────────────────────────
  // 🧠 Object state — grouping related fields into one useState
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  // ── Register form state ────────────────────────────────
  const [regForm, setRegForm] = useState({ name: '', email: '', password: '' })
  const [regError, setRegError]     = useState('')
  const [regSuccess, setRegSuccess] = useState('')
  const [regLoading, setRegLoading] = useState(false)

  // 🧠 If already logged in, redirect away immediately
  if (isLoggedIn) {
    return <Navigate to={isAdmin ? '/admin' : '/'} />
  }

  // ── Login handlers ─────────────────────────────────────

  // 🧠 This is the "updater" pattern for object state
  // Instead of writing a separate setter for each field,
  // one function handles all fields using the input's name attribute
  const handleLoginChange = (e) => {
    const { name, value } = e.target
    setLoginForm(prev => ({ ...prev, [name]: value }))
    //                      ↑ spread keeps other fields, [name] updates just this one
  }

  const handleLogin = async (e) => {
    // 🧠 e.preventDefault() — stops the browser from reloading the page
    // which is the default behaviour of form submission
    e.preventDefault()
    setLoginError('')

    // Client-side validation before hitting the API
    if (!loginForm.email || !loginForm.password) {
      setLoginError('Please fill in all fields')
      return
    }

    setLoginLoading(true)
    const res = await api.login(loginForm)
    setLoginLoading(false)

    if (res.token) {
      login(res.token, res.user)
      showToast(`Welcome back, ${res.user.name.split(' ')[0]}!`, 'success')
      navigate(res.user.role === 'admin' ? '/admin' : '/')
    } else {
      setLoginError(res.message || 'Login failed')
    }
  }

  // ── Register handlers ──────────────────────────────────

  const handleRegChange = (e) => {
    const { name, value } = e.target
    setRegForm(prev => ({ ...prev, [name]: value }))
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setRegError('')
    setRegSuccess('')

    // Validate before sending
    if (!regForm.name || !regForm.email || !regForm.password) {
      setRegError('Please fill in all fields')
      return
    }
    if (regForm.password.length < 6) {
      setRegError('Password must be at least 6 characters')
      return
    }

    setRegLoading(true)
    const res = await api.register(regForm)
    setRegLoading(false)

    if (res.userId) {
      setRegSuccess('Account created! Switching to login...')
      setRegForm({ name: '', email: '', password: '' })
      // 🧠 setTimeout inside a component — works just like normal JS
      setTimeout(() => {
        setActiveTab('login')
        setLoginForm({ email: regForm.email, password: '' })
        setRegSuccess('')
      }, 1500)
    } else {
      const msg = res.errors
        ? res.errors.map(e => e.message).join(', ')
        : res.message
      setRegError(msg || 'Registration failed')
    }
  }

  // ── Allow Enter key to submit ──────────────────────────
  const handleKeyDown = (e, submitFn) => {
    if (e.key === 'Enter') submitFn(e)
  }

  // ── Styles (reused across both forms) ─────────────────
  const inputStyle = {
    width: '100%', padding: '0.7rem 1rem',
    border: '2px solid var(--border)', borderRadius: '8px',
    fontSize: '0.95rem', outline: 'none',
    fontFamily: 'inherit', transition: 'border 0.2s',
  }

  const labelStyle = {
    display: 'block', fontWeight: 600,
    marginBottom: '0.4rem', fontSize: '0.9rem',
  }

  // ── JSX ────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)',
    }}>
      <div style={{
        background: 'var(--card)', borderRadius: '16px',
        padding: '2.5rem', width: '100%', maxWidth: '420px',
        boxShadow: 'var(--shadow)',
        margin: '1rem',
      }}>
        {/* Header */}
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', color: 'var(--primary)', fontSize: '1.8rem' }}>
          Shop<span style={{ color: 'var(--accent)' }}>Zone</span>
        </h2>

        {/* Tabs */}
        <div style={{ display: 'flex', marginBottom: '1.5rem', borderBottom: '2px solid var(--border)' }}>
          {['login', 'register'].map(tab => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab)
                setLoginError('')
                setRegError('')
                setRegSuccess('')
              }}
              style={{
                flex: 1, padding: '0.75rem',
                background: 'none', border: 'none',
                fontSize: '1rem', fontWeight: 600,
                cursor: 'pointer',
                color: activeTab === tab ? 'var(--primary)' : 'var(--muted)',
                borderBottom: activeTab === tab
                  ? '3px solid var(--primary)'
                  : '3px solid transparent',
                marginBottom: '-2px',
                transition: 'all 0.2s',
                textTransform: 'capitalize',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── LOGIN FORM ── */}
        {activeTab === 'login' && (
          // 🧠 <form onSubmit> — cleaner than onClick on a button
          // also handles pressing Enter in any input field
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1.2rem' }}>
              <label style={labelStyle}>Email</label>
              <input
                style={inputStyle}
                type="email"
                name="email"
                placeholder="you@example.com"
                value={loginForm.email}
                onChange={handleLoginChange}
                onKeyDown={e => handleKeyDown(e, handleLogin)}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
                autoFocus
              />
            </div>

            <div style={{ marginBottom: '1.2rem' }}>
              <label style={labelStyle}>Password</label>
              <input
                style={inputStyle}
                type="password"
                name="password"
                placeholder="••••••••"
                value={loginForm.password}
                onChange={handleLoginChange}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            {/* Error message */}
            {loginError && (
              <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                Error: {loginError}
              </p>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
              disabled={loginLoading}
            >
              {loginLoading ? 'Logging in...' : 'Login'}
            </button>

            <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--muted)' }}>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setActiveTab('register')}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}
              >
                Register
              </button>
            </p>
          </form>
        )}

        {/* ── REGISTER FORM ── */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: '1.2rem' }}>
              <label style={labelStyle}>Full Name</label>
              <input
                style={inputStyle}
                type="text"
                name="name"
                placeholder="John Doe"
                value={regForm.name}
                onChange={handleRegChange}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
                autoFocus
              />
            </div>

            <div style={{ marginBottom: '1.2rem' }}>
              <label style={labelStyle}>Email</label>
              <input
                style={inputStyle}
                type="email"
                name="email"
                placeholder="you@example.com"
                value={regForm.email}
                onChange={handleRegChange}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <div style={{ marginBottom: '1.2rem' }}>
              <label style={labelStyle}>Password</label>
              <input
                style={inputStyle}
                type="password"
                name="password"
                placeholder="Min 6 characters"
                value={regForm.password}
                onChange={handleRegChange}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              {/* 🧠 Live password strength hint */}
              {regForm.password && (
                <p style={{
                  fontSize: '0.78rem', marginTop: '0.3rem',
                  color: regForm.password.length >= 6 ? 'var(--success)' : 'var(--danger)',
                }}>
                  {regForm.password.length >= 6 ? 'Strong enough' : `${6 - regForm.password.length} more characters needed`}
                </p>
              )}
            </div>

            {/* Error / Success messages */}
            {regError && (
              <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                Error: {regError}
              </p>
            )}
            {regSuccess && (
              <p style={{ color: 'var(--success)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {regSuccess}
              </p>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
              disabled={regLoading}
            >
              {regLoading ? 'Creating account...' : 'Create Account'}
            </button>

            <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--muted)' }}>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}
              >
                Login
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

export default Login