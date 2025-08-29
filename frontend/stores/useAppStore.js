import api from '@/lib/api';
import { handleApiCall } from '@/lib/apiHelper';
import { STATUS } from '@/lib/constants';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const createAuthSlice = (set, get) => ({
  user: null,
  token: null,
  isAuthInitialized: false,
  authStatus: STATUS.IDLE,
  authError: null,

  initializeAuth: async () => {
    if (get().isAuthInitialized) return;
    try {
      const token = get().token;
      if (token) {
        const profileResult = await get().fetchUserProfile();
        if (!profileResult.success) {
          get().logout();
        }
      }
    } catch (err) {
      console.error('Auth init failed', err);
      get().logout();
    } finally {
      set({ isAuthInitialized: true });
    }
  },

  login: async ({ email, password }) => {
    set({ authStatus: STATUS.LOADING, authError: null });
    const result = await handleApiCall(
      api.post('/auth/login', { email, password })
    );

    if (result.success && result.data?.accessToken && result.data?.user) {
      const { accessToken, user } = result.data;
      set({
        user,
        token: accessToken,
        authStatus: STATUS.SUCCESS,
        authError: null,
      });

      const { default: useCartStore } = await import('./useCartStore');
      useCartStore.getState().fetchCart();
    } else {
      set({
        authStatus: STATUS.ERROR,
        authError: {
          title: 'Login Failed',
          description:
            result.error?.message || 'Invalid credentials or server error.',
        },
      });
    }
    return result;
  },

  register: async ({ name, email, password, confirmPassword, phone }) => {
    set({ authStatus: STATUS.LOADING, authError: null });
    const result = await handleApiCall(
      api.post('/auth/register', {
        name,
        email,
        password,
        confirmPassword,
        phone: phone || undefined,
      })
    );

    if (result.success && result.data?.accessToken && result.data?.user) {
      const { accessToken, user } = result.data;
      set({
        user,
        token: accessToken,
        authStatus: STATUS.SUCCESS,
        authError: null,
      });

      const { default: useCartStore } = await import('./useCartStore');
      useCartStore.getState().fetchCart();

      return { success: true, message: result.data.message };
    } else {
      const errorMessage =
        result.error?.message || 'Could not create your account.';
      set({
        authStatus: STATUS.ERROR,
        authError: {
          title: 'Registration Failed',
          description: errorMessage,
        },
      });
      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  logout: () => {
    set({
      user: null,
      token: null,
      authStatus: STATUS.IDLE,
      authError: null,
      sellers: [],
      sellersStatus: STATUS.IDLE,
      sellersError: null,
    });

    import('./useCartStore').then(({ default: useCartStore }) => {
      useCartStore.getState().clearCartLocal();
    });
  },

  fetchUserProfile: async () => {
    const result = await handleApiCall(api.get('/auth/me'));
    if (result.success && result.data?.user) {
      set({ user: result.data.user, authStatus: STATUS.SUCCESS });

      setTimeout(
        () =>
          import('./useCartStore').then(({ default: useCartStore }) =>
            useCartStore.getState().fetchCart()
          ),
        0
      );

      return { success: true };
    } else {
      get().logout();
      return { success: false };
    }
  },
});

const createSellersSlice = (set) => ({
  sellers: [],
  sellersStatus: STATUS.IDLE,
  sellersError: null,

  fetchSellers: async () => {
    set({ sellersStatus: STATUS.LOADING, sellersError: null });
    const result = await handleApiCall(api.get('/users/sellers'));
    if (result.success) {
      set({ sellers: result.data.sellers, sellersStatus: STATUS.SUCCESS });
    } else {
      set({
        sellersStatus: STATUS.ERROR,
        sellersError: {
          title: 'Fetch Failed',
          description: result.error?.message || 'Could not load sellers.',
        },
      });
    }
  },
});

const useAppStore = create(
  persist(
    (set, get) => ({
      ...createAuthSlice(set, get),
      ...createSellersSlice(set, get),
    }),
    {
      name: 'resellbay-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token }),
      onRehydrateStorage: () => {
        return () => {
          setTimeout(() => {
            useAppStore.getState().initializeAuth();
          }, 100);
        };
      },
    }
  )
);

export default useAppStore;
