import api from '@/lib/api';
import { handleApiCall } from '@/lib/apiHelper';
import { STATUS } from '@/lib/constants';
import { create } from 'zustand';

const calculateSummaryWithFees = (summary) => {
  if (!summary || summary.totalPrice === 0) {
    return { totalItems: 0, totalPrice: 0, platformFee: 0, finalTotal: 0 };
  }
  const platformFee = +(summary.totalPrice * 0.02 + 1).toFixed(2);
  const finalTotal = +(summary.totalPrice + platformFee).toFixed(2);
  return { ...summary, platformFee, finalTotal };
};

const initialState = {
  cart: null,
  summary: { totalItems: 0, totalPrice: 0, platformFee: 0, finalTotal: 0 },
  status: STATUS.IDLE,
  error: null,
};

const useCartStore = create((set, get) => ({
  ...initialState,
  _updateStateFromResponse: (data) => {
    const { cart, summary } = data || {};
    set({
      cart: cart || { items: [] },
      summary: calculateSummaryWithFees(summary || {}),
      status: STATUS.SUCCESS,
      error: null,
    });
  },
  fetchCart: async () => {
    setTimeout(() => set({ status: STATUS.LOADING }), 0);
    try {
      const result = await handleApiCall(api.get('/cart'));
      if (result.success) get()._updateStateFromResponse(result.data);
      else set({ status: STATUS.ERROR, error: result.error });
      return result;
    } catch (err) {
      set({ status: STATUS.ERROR, error: { message: err.message } });
      return { success: false, error: { message: err.message } };
    }
  },

  addToCart: async (productId, quantity = 1) => {
    const result = await handleApiCall(
      api.post('/cart', { productId, quantity })
    );
    if (result.success) {
      get()._updateStateFromResponse(result.data);
    }
    return result;
  },

  updateCartItem: async (productId, quantity) => {
    if (quantity < 1) {
      return get().removeCartItem(productId);
    }
    const result = await handleApiCall(
      api.put(`/cart/items/${productId}`, { quantity })
    );
    if (result.success) {
      get()._updateStateFromResponse(result.data);
    }
    return result;
  },

  removeCartItem: async (productId) => {
    const result = await handleApiCall(api.delete(`/cart/items/${productId}`));
    if (result.success) {
      get()._updateStateFromResponse(result.data);
    }
    return result;
  },

  checkout: async (shippingAddress) => {
    setTimeout(() => {
      set({ status: STATUS.LOADING });
    }, 0);

    const { cart } = get();

    if (!cart?.items?.length) {
      const error = {
        title: 'Checkout Error',
        description: 'Your cart is empty.',
      };
      set({ status: STATUS.ERROR, error });
      return { success: false, error };
    }

    const payload = { shippingAddress, cartId: cart._id };
    const result = await handleApiCall(api.post('/checkout', payload));

    if (result.success) {
      get().clearCartLocal();
      return { success: true, order: result.data.order };
    } else {
      set({ status: STATUS.ERROR, error: result.error });
      return { success: false, error: result.error };
    }
  },

  clearCartLocal: () => set({ ...initialState }),
}));

export default useCartStore;
