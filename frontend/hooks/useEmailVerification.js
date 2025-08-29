'use client';

import api from '@/lib/api';
import { STATUS } from '@/lib/constants';
import { useCallback, useEffect, useState } from 'react';

export function useEmailVerification(token, options = {}) {
  const { onSuccess, onError } = options;

  const [status, setStatus] = useState(STATUS.LOADING);
  const [message, setMessage] = useState('Verifying your email address...');

  const verifyToken = useCallback(async () => {
    if (!token) {
      const errMsg = 'No verification token provided. The link may be invalid.';
      setStatus(STATUS.ERROR);
      setMessage(errMsg);
      onError?.({ message: errMsg });
      return;
    }

    setStatus(STATUS.LOADING);
    setMessage('Verifying your email address...');

    try {
      const response = await api.post(`/auth/verify/${token}`);
      const successMsg =
        response.data?.message || 'Email verified successfully!';
      setStatus(STATUS.SUCCESS);
      setMessage(successMsg);
      onSuccess?.({ message: successMsg });
    } catch (err) {
      const errorData = err.response?.data;
      let errMsg = 'Verification failed. The token may be invalid or expired.';

      if (errorData?.message) {
        errMsg = errorData.message;
      } else if (err.response?.status === 400) {
        errMsg = 'Invalid verification token.';
      } else if (err.response?.status === 404) {
        errMsg = 'User not found.';
      }

      setStatus(STATUS.ERROR);
      setMessage(errMsg);
      onError?.({
        message: errMsg,
        status: err.response?.status || 500,
        data: errorData,
      });
    }
  }, [token, onSuccess, onError]);

  useEffect(() => {
    if (token) {
      verifyToken();
    }
  }, [token, verifyToken]);

  return { status, message };
}
