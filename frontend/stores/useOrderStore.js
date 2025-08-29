import { create } from 'zustand';
import api from '../lib/api';
import { handleApiCall } from '../lib/apiHelper';
import { STATUS } from '../lib/constants';
import useAppStore from './useAppStore';

const useOrderStore = create((set, get) => ({
  orders: [],
  pagination: {
    page: 1,
    totalPages: 1,
    totalOrders: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
  selectedOrder: null,
  status: STATUS.IDLE,
  error: null,

  fetchOrderHistory: async (page = 1, limit = 10) => {
    const { token } = useAppStore.getState();

    if (!token) {
      set({ status: STATUS.IDLE, error: null });
      return { success: false, error: { message: 'Not authenticated' } };
    }

    set({ status: STATUS.LOADING, error: null });

    const result = await handleApiCall(
      api.get(`/orders?page=${page}&limit=${limit}`)
    );

    if (result.success) {
      set({
        orders: result.data.orders || [],
        pagination: result.data.pagination || get().pagination,
        status: STATUS.SUCCESS,
        error: null,
      });
    } else {
      set({
        status: STATUS.ERROR,
        error: result.error.message || 'Failed to fetch orders',
      });
    }

    return result;
  },

  fetchOrderById: async (orderId) => {
    const { token } = useAppStore.getState();

    if (!token) {
      set({ status: STATUS.IDLE, error: null });
      return { success: false, error: { message: 'Not authenticated' } };
    }

    set({ selectedOrder: null, status: STATUS.LOADING, error: null });

    const result = await handleApiCall(api.get(`/orders/${orderId}`));

    if (result.success) {
      set({
        selectedOrder: result.data.order,
        status: STATUS.SUCCESS,
        error: null,
      });
    } else {
      set({
        status: STATUS.ERROR,
        error: result.error.message || 'Failed to fetch order',
      });
    }

    return result;
  },
}));

export default useOrderStore;
