import { create } from 'zustand';
import api from '../lib/api';
import { handleApiCall } from '../lib/apiHelper';
import { STATUS } from '../lib/constants';
import useAppStore from './useAppStore';

const DEFAULT_FILTERS = {
  search: '',
  category: '',
  minPrice: '',
  maxPrice: '',
  limit: 12,
  sellerId: '',
  isMyListing: false,
};

const useProductStore = create((set, get) => ({
  products: [],
  selectedProduct: null,
  pagination: {
    page: 1,
    totalPages: 1,
    totalProducts: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
  filters: { ...DEFAULT_FILTERS },
  status: STATUS.IDLE,
  error: null,

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      pagination: { ...state.pagination, page: 1 },
    }));
  },

  clearFilters: () => {
    set({ filters: { ...DEFAULT_FILTERS } });
  },

  fetchProducts: async (page = 1, additionalFilters = {}) => {
    set({ status: STATUS.LOADING, error: null });

    const currentFilters = { ...get().filters, ...additionalFilters };
    const { token } = useAppStore.getState();

    const params = new URLSearchParams(
      Object.entries(currentFilters).filter(
        ([_, value]) =>
          value !== '' &&
          value != null &&
          !(typeof value === 'boolean' && value === false)
      )
    );
    params.set('page', page);

    const endpoint = currentFilters.isMyListing
      ? `/products/my/listings?${params.toString()}`
      : `/products?${params.toString()}`;

    const result = await handleApiCall(
      api.get(endpoint, {
        headers: currentFilters.isMyListing
          ? { Authorization: `Bearer ${token}` }
          : {},
      })
    );

    if (result.success) {
      set({
        products: Array.isArray(result.data.products)
          ? result.data.products
          : [],
        pagination: result.data.pagination || get().pagination,
        status: STATUS.SUCCESS,
        error: null,
      });
    } else {
      set({
        status: STATUS.ERROR,
        error: result.error || { message: 'Failed to fetch products' },
      });
    }

    return result;
  },

  fetchProductById: async (productId) => {
    set({ selectedProduct: null, status: STATUS.LOADING, error: null });

    const result = await handleApiCall(api.get(`/products/${productId}`));

    if (result.success) {
      set({
        selectedProduct: result.data.product,
        status: STATUS.SUCCESS,
        error: null,
      });
    } else {
      set({
        status: STATUS.ERROR,
        error: result.error || { message: 'Failed to fetch product' },
      });
    }

    return result;
  },

  createProduct: async (productData) => {
    const { token } = useAppStore.getState();

    const result = await handleApiCall(
      api.post('/products', productData, {
        headers: { Authorization: `Bearer ${token}` },
      })
    );

    if (result.success && result.data?.product) {
      set((state) => ({
        products: [result.data.product, ...state.products],
      }));
    }

    return result;
  },

  updateProduct: async (productId, productData) => {
    const { token } = useAppStore.getState();

    const result = await handleApiCall(
      api.get(`/products/my/listings?page=${page}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    );
    console.log('My Listings API Result:', result);

    if (result.success && result.data?.product) {
      const updatedProduct = result.data.product;
      set((state) => ({
        products: state.products.map((p) =>
          p._id === productId ? updatedProduct : p
        ),
        selectedProduct:
          state.selectedProduct?._id === productId
            ? updatedProduct
            : state.selectedProduct,
      }));
    }

    return result;
  },

  deleteProduct: async (productId) => {
    const { token } = useAppStore.getState();

    const result = await handleApiCall(
      api.delete(`/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    );

    if (result?.success) {
      set((state) => {
        const updatedProducts = state.products.filter(
          (p) => p._id !== productId
        );

        return {
          products: updatedProducts,
          selectedProduct:
            state.selectedProduct?._id === productId
              ? null
              : state.selectedProduct,
        };
      });
    }

    return result;
  },
  toggleLike: async (productId) => {
    const { token } = useAppStore.getState();
    const originalState = get();
    const product = originalState.products.find((p) => p._id === productId);

    if (!product) return;

    const wasLiked = product.likedByUser;
    const optimisticLikes = wasLiked
      ? product.likesCount - 1
      : product.likesCount + 1;

    set((state) => ({
      products: state.products.map((p) =>
        p._id === productId
          ? { ...p, likedByUser: !wasLiked, likesCount: optimisticLikes }
          : p
      ),
      selectedProduct:
        state.selectedProduct?._id === productId
          ? {
              ...state.selectedProduct,
              likedByUser: !wasLiked,
              likesCount: optimisticLikes,
            }
          : state.selectedProduct,
    }));

    try {
      const endpoint = `/products/${productId}/like`;
      const result = await handleApiCall(
        api.post(endpoint, null, {
          headers: { Authorization: `Bearer ${token}` },
        })
      );

      if (result?.product) {
        set((state) => ({
          products: state.products.map((p) =>
            p._id === productId ? result.product : p
          ),
          selectedProduct:
            state.selectedProduct?._id === productId
              ? result.product
              : state.selectedProduct,
        }));
      }

      return result;
    } catch (error) {
      set(originalState);
      throw error;
    }
  },

  clearSelectedProduct: () =>
    set({ selectedProduct: null, status: STATUS.IDLE, error: null }),

  fetchLikedProducts: async () => {
    set({ likedStatus: STATUS.LOADING, error: null });
    const result = await handleApiCall(api.get('/products/my/likes'));

    if (result.success) {
      set({
        likedProducts: result.data.likedProducts || [],
        likedStatus: STATUS.SUCCESS,
      });
    } else {
      set({
        likedStatus: STATUS.ERROR,
        error: result.error,
      });
    }
    return result;
  },
}));

export default useProductStore;
