import apiClient from '../services/api';

// Resolve image candidate to an absolute URL usable by the frontend.
// Handles full URLs, data URIs and relative paths returned by the backend.
export function resolveImageUrl(candidate) {
  if (!candidate) return '';
  if (typeof candidate !== 'string') return '';
  if (candidate.startsWith('http://') || candidate.startsWith('https://') || candidate.startsWith('data:')) {
    return candidate;
  }

  const base = apiClient?.defaults?.baseURL || '';
  // If backend returned a path like '/api/admin/products/images/...' or 'uploads/..'
  if (candidate.startsWith('/')) {
    return `${base}${candidate}`;
  }

  return `${base}/${candidate}`;
}

export default { resolveImageUrl };
