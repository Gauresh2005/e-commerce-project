const BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

const getToken = () => localStorage.getItem('token');

const authHeader = () => ({
  'Authorization': `Bearer ${getToken()}`,
  'Content-Type': 'application/json',
});

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `HTTP Error: ${response.status}`);
  }
  return data;
};

const api = {
  // ── Users ──────────────────────────────────────────────
  register: (data) =>
    fetch(`${BASE_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    }).then(handleResponse),

  login: (data) =>
    fetch(`${BASE_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    }).then(handleResponse),

  getProfile: () =>
    fetch(`${BASE_URL}/users/profile`, {
      headers: authHeader(),
      credentials: 'include',
    }).then(handleResponse),

  // ── Products ───────────────────────────────────────────
  getProducts: () =>
    fetch(`${BASE_URL}/products`, {
      credentials: 'include',
    }).then(handleResponse),

  getProduct: (id) =>
    fetch(`${BASE_URL}/products/${id}`, {
      credentials: 'include',
    }).then(handleResponse),

  createProduct: (data) =>
    fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify(data),
      credentials: 'include',
    }).then(handleResponse),

  updateProduct: (id, data) =>
    fetch(`${BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify(data),
      credentials: 'include',
    }).then(handleResponse),

  deleteProduct: (id) =>
    fetch(`${BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: authHeader(),
      credentials: 'include',
    }).then(handleResponse),

  // ── Cart ───────────────────────────────────────────────
  getCart: () =>
    fetch(`${BASE_URL}/cart`, { 
      headers: authHeader(),
      credentials: 'include',
    }).then(handleResponse),

  addToCart: (product_id, quantity) =>
    fetch(`${BASE_URL}/cart`, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify({ product_id, quantity }),
      credentials: 'include',
    }).then(handleResponse),

  updateCartItem: (productId, quantity) =>
    fetch(`${BASE_URL}/cart/${productId}`, {
      method: 'PUT',
      headers: authHeader(),
      body: JSON.stringify({ quantity }),
      credentials: 'include',
    }).then(handleResponse),

  removeCartItem: (productId) =>
    fetch(`${BASE_URL}/cart/${productId}`, {
      method: 'DELETE',
      headers: authHeader(),
      credentials: 'include',
    }).then(handleResponse),

  clearCart: () =>
    fetch(`${BASE_URL}/cart`, {
      method: 'DELETE',
      headers: authHeader(),
      credentials: 'include',
    }).then(handleResponse),

  // ── Orders ─────────────────────────────────────────────
  placeOrder: () =>
    fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: authHeader(),
      credentials: 'include',
    }).then(handleResponse),

  getMyOrders: () =>
    fetch(`${BASE_URL}/orders/my`, { 
      headers: authHeader(),
      credentials: 'include',
    }).then(handleResponse),

  getOrder: (id) =>
    fetch(`${BASE_URL}/orders/${id}`, { 
      headers: authHeader(),
      credentials: 'include',
    }).then(handleResponse),

  getAllOrders: () =>
    fetch(`${BASE_URL}/orders`, { 
      headers: authHeader(),
      credentials: 'include',
    }).then(handleResponse),

  updateOrderStatus: (id, status) =>
    fetch(`${BASE_URL}/orders/${id}/status`, {
      method: 'PUT',
      headers: authHeader(),
      body: JSON.stringify({ status }),
      credentials: 'include',
    }).then(handleResponse),
};

export default api;