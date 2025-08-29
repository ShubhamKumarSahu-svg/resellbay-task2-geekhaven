import { create } from 'zustand';
import api from '../lib/api';
import { handleApiCall } from '../lib/apiHelper';
import { STATUS } from '../lib/constants';
import useAppStore from './useAppStore';

const useReviewStore = create((set, get) => ({
  reviews: [],
  status: STATUS.IDLE,
  error: null,

  fetchReviews: async (type, id) => {
    set({ status: STATUS.LOADING, error: null });

    const endpoint =
      type === 'user' ? `/reviews/users/${id}` : `/reviews/products/${id}`;

    const result = await handleApiCall(api.get(endpoint));

    if (result.success) {
      set({
        reviews: result.data.reviews || [],
        status: STATUS.SUCCESS,
        error: null,
      });
    } else {
      set({ reviews: [], status: STATUS.ERROR, error: result.error });
    }

    return result;
  },

  createReview: async (reviewDetails) => {
    const { token } = useAppStore.getState();
    if (!token) {
      const error = { message: 'Not authenticated' };
      set({ status: STATUS.ERROR, error });
      return { success: false, error };
    }

    set({ status: STATUS.LOADING, error: null });

    const { orderId, type, targetId, rating, comment } = reviewDetails;
    const endpoint = `/reviews/orders/${orderId}/${type}`;

    const payload = { rating, comment };
    if (type === 'product') {
      payload.productId = targetId;
    }

    const result = await handleApiCall(
      api.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
    );

    if (result.success && result.data?.review) {
      set((state) => ({
        reviews: [result.data.review, ...state.reviews],
        status: STATUS.SUCCESS,
        error: null,
      }));
    } else {
      set({ status: STATUS.ERROR, error: result.error });
    }

    return result;
  },

  clearReviews: () => set({ reviews: [], status: STATUS.IDLE, error: null }),

  clearError: () => set({ error: null }),
}));

export default useReviewStore;
