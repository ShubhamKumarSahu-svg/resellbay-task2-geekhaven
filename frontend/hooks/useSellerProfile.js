'use client';

import api from '@/lib/api';
import { handleApiCall } from '@/lib/apiHelper';
import { STATUS } from '@/lib/constants';
import { useCallback, useEffect, useState } from 'react';

export function useSellerProfile(sellerId) {
  const [seller, setSeller] = useState(null);
  const [listings, setListings] = useState([]);
  const [status, setStatus] = useState(STATUS.IDLE);
  const [error, setError] = useState(null);

  const fetchSellerData = useCallback(async () => {
    if (!sellerId) return;

    setStatus(STATUS.LOADING);
    setError(null);

    try {
      const [sellerRes, listingsRes] = await Promise.all([
        handleApiCall(api.get(`/users/${sellerId}`)),
        handleApiCall(api.get(`/products?seller=${sellerId}`)),
      ]);

      if (sellerRes.success) setSeller(sellerRes.data.user);
      if (listingsRes.success) setListings(listingsRes.data.products);

      if (!sellerRes.success || !listingsRes.success) {
        const errMsg =
          sellerRes.error?.message ||
          listingsRes.error?.message ||
          'Unknown error';
        setError(errMsg);
        setStatus(STATUS.ERROR);
      } else {
        setStatus(STATUS.SUCCESS);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch seller data');
      setStatus(STATUS.ERROR);
    }
  }, [sellerId]);

  useEffect(() => {
    fetchSellerData();
  }, [fetchSellerData]);

  return { seller, listings, status, error, refetch: fetchSellerData };
}
