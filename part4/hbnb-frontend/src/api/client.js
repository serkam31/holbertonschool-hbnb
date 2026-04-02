const BASE_URL = 'http://127.0.0.1:5000/api/v1'

function getToken() {
  return localStorage.getItem('token')
}

async function request(endpoint, options = {}) {
  const token = getToken()

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    localStorage.removeItem('token')
    window.location.href = '/login'
    return
  }

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Une erreur est survenue')
  }

  return data
}

// Auth
export const login = (email, password) =>
  request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

// Users
export const getUsers = () => request('/users/')
export const getUser = (id) => request(`/users/${id}`)
export const updateUser = (id, data) =>
  request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) })

// Places
export const getPlaces = () => request('/places/')
export const getPlace = (id) => request(`/places/${id}`)
export const createPlace = (data) =>
  request('/places/', { method: 'POST', body: JSON.stringify(data) })
export const updatePlace = (id, data) =>
  request(`/places/${id}`, { method: 'PUT', body: JSON.stringify(data) })

// Reviews
export const getReviews = () => request('/reviews/')
export const getReviewsByPlace = (placeId) => request(`/places/${placeId}/reviews`)
export const createReview = (data) =>
  request('/reviews/', { method: 'POST', body: JSON.stringify(data) })
export const updateReview = (id, data) =>
  request(`/reviews/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteReview = (id) =>
  request(`/reviews/${id}`, { method: 'DELETE' })

// Amenities
export const getAmenities = () => request('/amenities/')
export const createAmenity = (data) =>
  request('/amenities/', { method: 'POST', body: JSON.stringify(data) })
export const updateAmenity = (id, data) =>
  request(`/amenities/${id}`, { method: 'PUT', body: JSON.stringify(data) })