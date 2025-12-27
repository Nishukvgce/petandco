import api from './api';

const couponApi = {
  list: async () => {
    const res = await api.get('/coupons');
    return res?.data || [];
  },
  create: async (coupon) => {
    const res = await api.post('/coupons', coupon);
    return res?.data;
  },
  update: async (id, coupon) => {
    const res = await api.put(`/coupons/${id}`, coupon);
    return res?.data;
  },
  remove: async (id) => {
    const res = await api.delete(`/coupons/${id}`);
    return res?.data;
  },
  validate: async ({ code, subtotal, petType, category, subcategory }) => {
    try {
      const res = await api.post('/coupons/validate', {
        code, subtotal, petType, category, subcategory
      });
      return { valid: true, ...res?.data };
    } catch (err) {
      const reason = err?.response?.data?.reason || 'Invalid coupon';
      return { valid: false, reason };
    }
  }
};

export default couponApi;
