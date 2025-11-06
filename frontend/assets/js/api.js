const API_BASE = '/api';

const storage = {
  getToken() {
    return localStorage.getItem('access_token');
  },
  setToken(token) {
    localStorage.setItem('access_token', token);
  },
  clear() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('current_user');
  },
  getUser() {
    const raw = localStorage.getItem('current_user');
    return raw ? JSON.parse(raw) : null;
  },
  setUser(user) {
    localStorage.setItem('current_user', JSON.stringify(user));
  }
};

async function request(path, options = {}) {
  const headers = options.headers || {};
  const token = storage.getToken();
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    body: options.body instanceof FormData ? options.body : options.body ? JSON.stringify(options.body) : undefined
  });

  if (response.status === 401) {
    storage.clear();
    window.location.href = '/auth.html';
    return Promise.reject(new Error('未授权'));
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || '请求失败');
    error.details = data.details;
    throw error;
  }

  return data;
}

function showToast(message, type = 'info') {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.background = type === 'error' ? '#b91c1c' : type === 'success' ? '#15803d' : '#111827';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

function ensureAuth(requiredRole) {
  const user = storage.getUser();
  if (!user) {
    window.location.href = '/auth.html';
    return null;
  }
  if (requiredRole && user.role !== requiredRole) {
    window.location.href = '/index.html';
    return null;
  }
  return user;
}

export { request, storage, showToast, ensureAuth };
