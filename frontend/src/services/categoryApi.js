import apiClient from './api';
import cache from './simpleCache';

const categoryApi = {
  async getAll() {
    const cacheKey = 'categories:all';
    const { cached, fresh } = cache.staleWhileRevalidate(cacheKey, async () => {
      const res = await import('./api').then(m => m.getWithRetry('/categories'));
      return res.data;
    }, 60 * 1000, true);

    if (cached) return cached;
    return await fresh;
  },
  async getById(categoryId) {
    const res = await apiClient.get(`/categories/${categoryId}`);
    return res.data;
  },
  async add(categoryPayload) {
    const res = await apiClient.post('/admin/categories', categoryPayload);
    return res.data;
  },
  async update(categoryId, categoryPayload) {
    const res = await apiClient.put(`/admin/categories/${categoryId}`, categoryPayload);
    return res.data;
  },
  async remove(categoryId) {
    const res = await apiClient.delete(`/admin/categories/${categoryId}`);
    return res.data;
  }
};

export default categoryApi;
