export async function handleApiCall(axiosPromise) {
  try {
    const response = await axiosPromise;
    return { success: true, data: response.data, error: null };
  } catch (err) {
    const status = err?.response?.status || 500;
    const data = err?.response?.data;

    if (process.env.NODE_ENV !== 'production') {
      console.error('API Error:', status, data || err.message, err);
    }

    const error = {
      title: data?.errorCode || 'Error',
      message: data?.message || err.message || 'An unknown API error occurred.',
      status,
      ...(process.env.NODE_ENV !== 'production' ? { original: err } : {}),
    };

    return { success: false, data: null, error };
  }
}
