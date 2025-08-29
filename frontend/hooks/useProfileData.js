import { STATUS } from '@/lib/constants';
import useAppStore from '@/stores/useAppStore';
import useOrderStore from '@/stores/useOrderStore';
import useProductStore from '@/stores/useProductStore';
import { useCallback, useEffect, useState } from 'react';

export function useProfileData(userId = null) {
  const { isAuthenticated, token } = useAppStore(); // auth state
  const {
    products,
    status: listingsStatus,
    error: listingsError,
    fetchProducts,
    setFilters,
    clearFilters,
  } = useProductStore();

  const {
    orders,
    status: ordersStatus,
    error: ordersError,
    fetchOrderHistory,
  } = useOrderStore();

  const [overallStatus, setOverallStatus] = useState(STATUS.LOADING);

  const loadProfileData = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setOverallStatus(STATUS.IDLE);
      return { myListings: [], orders: [] };
    }

    try {
      setFilters({ sellerId: userId || undefined, isMyListing: true });

      const [productsResult, ordersResult] = await Promise.all([
        fetchProducts(1),
        fetchOrderHistory(1),
      ]);

      const safeProducts =
        productsResult?.data?.products &&
        Array.isArray(productsResult.data.products)
          ? productsResult.data.products
          : [];
      const safeOrders =
        ordersResult?.data?.orders && Array.isArray(ordersResult.data.orders)
          ? ordersResult.data.orders
          : [];

      return { myListings: safeProducts, orders: safeOrders };
    } catch (err) {
      console.error('Error loading profile data:', err);
      setOverallStatus(STATUS.ERROR);
      return { myListings: [], orders: [] };
    }
  }, [
    isAuthenticated,
    token,
    userId,
    fetchProducts,
    fetchOrderHistory,
    setFilters,
  ]);

  useEffect(() => {
    loadProfileData();

    return () => clearFilters();
  }, [loadProfileData, clearFilters]);

  useEffect(() => {
    if (!isAuthenticated) {
      setOverallStatus(STATUS.IDLE);
    } else if (
      listingsStatus === STATUS.LOADING ||
      ordersStatus === STATUS.LOADING
    ) {
      setOverallStatus(STATUS.LOADING);
    } else if (
      listingsStatus === STATUS.ERROR ||
      ordersStatus === STATUS.ERROR
    ) {
      setOverallStatus(STATUS.ERROR);
    } else if (
      listingsStatus === STATUS.SUCCESS &&
      ordersStatus === STATUS.SUCCESS
    ) {
      setOverallStatus(STATUS.SUCCESS);
    } else {
      setOverallStatus(STATUS.IDLE);
    }
  }, [isAuthenticated, listingsStatus, ordersStatus]);

  const refetch = useCallback(() => loadProfileData(), [loadProfileData]);

  return {
    myListings: Array.isArray(products) ? products : [],
    orders: Array.isArray(orders) ? orders : [],
    status: overallStatus,
    error: listingsError || ordersError,
    refetch,
  };
}
