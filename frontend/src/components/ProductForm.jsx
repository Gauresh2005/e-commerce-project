import { useState, useEffect } from 'react'
import { useToast } from '../context/ToastContext'
import api from '../api'

// 🧠 This component receives:
// product — null (create mode) or a product object (edit mode)
// onSuccess — called after successful save so parent can refresh
// onCancel — called when user cancels
function ProductForm({ product, onSuccess, onCancel }) {
  const { showToast } = useToast()
  const isEditing = !!product   // true if editing, false if creating

  // 🧠 Initialize form with product data if editing, empty if creating
  const [form, setForm] = useState({
    name:        product?.name        || '',
    description: product?.description || '',
    price:       product?.price       || '',
    stock:       product?.stock       || '',
  })
  const [imageFile, setImageFile]   = useState(null)
  const [imagePreview, setImagePreview] = useState(
    product?.image ? `http://localhost:3000${product.image}` : null
  )
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)

  // 🧠 If the product prop changes (switching from edit one product to another)
  // reset the form with new data
  useEffect(() => {
    setForm({
      name:        product?.name        || '',
      description: product?.description || '',
      price:       product?.price       || '',
      stock:       product?.stock       || '',
    })
    setImageFile(null)
    setImagePreview(product?.image ? `http://localhost:3000${product.image}` : null)
    setErrors({})
  }, [product])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    // Clear error for this field as user types
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  // 🧠 Handle image file selection — create a preview URL
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setImageFile(file)
    // 🧠 URL.createObjectURL — creates a temporary local URL for preview
    // without uploading to server yet
    setImagePreview(URL.createObjectURL(file))
  }

  // Client-side validation
  const validate = () => {
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'Name is required'
    if (!form.price)       newErrors.price = 'Price is required'
    if (isNaN(form.price) || Number(form.price) <= 0)
      newErrors.price = 'Price must be a positive number'
    if (form.stock !== '' && (isNaN(form.stock) || Number(form.stock) < 0))
      newErrors.stock = 'Stock must be 0 or more'
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    // Build payload as JSON. If an image is selected, convert to base64 data URL
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: form.price,
      stock: form.stock || 0,
    }

    if (imageFile) {
      // Convert file to data URL (base64)
      const toDataURL = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      try {
        const dataUrl = await toDataURL(imageFile)
        payload.imageData = dataUrl
      } catch (err) {
        showToast('Failed to read image file', 'error')
        setLoading(false)
        return
      }
    }

    setLoading(true)
    const res = isEditing
      ? await api.updateProduct(product.id, payload)
      : await api.createProduct(payload)
    setLoading(false)

    if (res.message && res.success !== false) {
      showToast(
        isEditing ? 'Product updated successfully!' : 'Product created successfully!',
        'success'
      )
      onSuccess()
    } else {
      const msg = res.errors
        ? res.errors.map(e => e.message).join(', ')
        : res.message
      showToast(msg || 'Failed to save product', 'error')
    }
  }

  const inputStyle = (hasError) => ({
    width: '100%', padding: '0.7rem 1rem',
    border: `2px solid ${hasError ? 'var(--danger)' : 'var(--border)'}`,
    borderRadius: '8px', fontSize: '0.95rem',
    outline: 'none', fontFamily: 'inherit',
    transition: 'border 0.2s',
  })

  const labelStyle = {
    display: 'block', fontWeight: 600,
    marginBottom: '0.4rem', fontSize: '0.9rem',
  }

  return (
    <form onSubmit={handleSubmit}>

      {/* Name */}
      <div style={{ marginBottom: '1.2rem' }}>
        <label style={labelStyle}>Product Name *</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="e.g. Wireless Headphones"
          style={inputStyle(errors.name)}
          onFocus={e => e.target.style.borderColor = errors.name ? 'var(--danger)' : 'var(--primary)'}
          onBlur={e => e.target.style.borderColor = errors.name ? 'var(--danger)' : 'var(--border)'}
        />
        {errors.name && (
          <p style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: '0.3rem' }}>
            {errors.name}
          </p>
        )}
      </div>

      {/* Description */}
      <div style={{ marginBottom: '1.2rem' }}>
        <label style={labelStyle}>Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Product description..."
          rows={3}
          style={{ ...inputStyle(false), resize: 'vertical' }}
          onFocus={e => e.target.style.borderColor = 'var(--primary)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
      </div>

      {/* Price + Stock side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
        <div>
          <label style={labelStyle}>Price (₹) *</label>
          <input
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            placeholder="999.99"
            min="0"
            step="0.01"
            style={inputStyle(errors.price)}
            onFocus={e => e.target.style.borderColor = errors.price ? 'var(--danger)' : 'var(--primary)'}
            onBlur={e => e.target.style.borderColor = errors.price ? 'var(--danger)' : 'var(--border)'}
          />
          {errors.price && (
            <p style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: '0.3rem' }}>
              {errors.price}
            </p>
          )}
        </div>
        <div>
          <label style={labelStyle}>Stock</label>
          <input
            name="stock"
            type="number"
            value={form.stock}
            onChange={handleChange}
            placeholder="0"
            min="0"
            style={inputStyle(errors.stock)}
            onFocus={e => e.target.style.borderColor = errors.stock ? 'var(--danger)' : 'var(--primary)'}
            onBlur={e => e.target.style.borderColor = errors.stock ? 'var(--danger)' : 'var(--border)'}
          />
          {errors.stock && (
            <p style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: '0.3rem' }}>
              {errors.stock}
            </p>
          )}
        </div>
      </div>

      {/* Image upload */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={labelStyle}>Product Image</label>

        {/* Image preview */}
        {imagePreview && (
          <div style={{ marginBottom: '0.75rem', position: 'relative', display: 'inline-block' }}>
            <img
              src={imagePreview}
              alt="Preview"
              style={{
                width: '100px', height: '100px',
                objectFit: 'cover', borderRadius: '8px',
                border: '2px solid var(--border)',
              }}
            />
            {/* Remove image button */}
            <button
              type="button"
              onClick={() => { setImageFile(null); setImagePreview(null) }}
              style={{
                position: 'absolute', top: '-8px', right: '-8px',
                background: 'var(--danger)', color: 'white',
                border: 'none', borderRadius: '50%',
                width: '22px', height: '22px',
                cursor: 'pointer', fontSize: '0.7rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              Remove
            </button>
          </div>
        )}

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageChange}
          style={{ display: 'block', fontSize: '0.9rem' }}
        />
        <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.3rem' }}>
          JPEG, PNG or WebP. Max 2MB.
          {isEditing && !imageFile && product?.image && ' Upload new to replace existing.'}
        </p>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          type="submit"
          className="btn btn-primary"
          style={{ flex: 1, justifyContent: 'center' }}
          disabled={loading}
        >
          {loading
            ? 'Saving...'
            : isEditing ? 'Update Product' : 'Create Product'
          }
        </button>
        <button
          type="button"
          className="btn btn-outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export default ProductForm