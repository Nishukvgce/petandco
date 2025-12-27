import axios from 'axios';

// Base URL from environment variables (Vite uses import.meta.env)
const baseURL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8081/api';

export const apiClient = axios.create({
  baseURL,
  timeout: 12000
});

// Request interceptor: attach auth token if present
apiClient.interceptors.request.use(
  (config) => {
    try {
      // Check for admin user token first (for admin panel operations)
      const storedAdminUser = localStorage.getItem('adminUser');
      let token = null;
      
      if (storedAdminUser) {
        const adminUser = JSON.parse(storedAdminUser);
        token = adminUser?.token || adminUser?.accessToken;
      }
      
      // Fall back to regular user token if admin token not found
      if (!token) {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          token = user?.token || user?.accessToken;
        }
      }
      
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // Ignore JSON parse errors; proceed without token
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      // Unauthorized: clear session and optionally redirect to login
      try {
        localStorage.removeItem('user');
      } catch {}
      // Lightweight redirect guard to avoid breaking SSR/testing
      if (typeof window !== 'undefined') {
        const current = window.location.pathname + window.location.search;
        const loginUrl = `/user-login?from=${encodeURIComponent(current)}`;
        // Avoid redirect loops
        if (!window.location.pathname.includes('/user-login')) {
          window.location.replace(loginUrl);
        }
      }
    }

    // Optional: centralized logging
    if (import.meta.env?.MODE !== 'production') {
      // eslint-disable-next-line no-console
      console.error('API Error:', {
        url: error?.config?.url,
        method: error?.config?.method,
        status: error?.response?.status,
        data: error?.response?.data
      });
    }

    return Promise.reject(error);
  }
);

export default apiClient;

// Lightweight retry for GET requests: attempts up to 2 retries with small backoff
export async function getWithRetry(url, config = {}, retries = 2) {
  let attempt = 0;
  const backoff = (n) => new Promise(r => setTimeout(r, Math.min(500 * n, 2000)));
  while (true) {
    try {
      const res = await apiClient.get(url, config);
      return res;
    } catch (err) {
      attempt++;
      const status = err?.response?.status;
      // Retry on network errors or 5xx
      if (attempt > retries || (status && status < 500)) throw err;
      await backoff(attempt);
    }
  }
}


