const API_BASE = "https://simonsmcplc.xubi.org/api/v1";

export const useApi = () => {
  const auth = useAuth();
  const syncQueue = useSyncQueueStore();
  const { isEmpty } = useComposables();

  const getHeaders = () => {
    const headers = {
      "Content-Type": "application/json",
    };
    if (auth.token.value) {
      headers.Authorization = `Bearer ${auth.token.value}`;
    }
    return headers;
  };

  const getUploadHeaders = () => {
    const headers = {};
    if (auth.token.value) {
      headers.Authorization = `Bearer ${auth.token.value}`;
    }
    return headers;
  };

  const request = async (endpoint, options = {}) => {
    const url = `${API_BASE}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...getHeaders(),
        ...options.headers,
      },
    };

    try {
      const data = await $fetch(url, config);
      return data;
    } catch (error) {
      if (error.status === 401) {
        auth.logout();
        await navigateTo("/sign-in");
      }
      throw error;
    }
  };

  const upload = (endpoint, formData) => {
    return $fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      body: formData,
      headers: getUploadHeaders(),
    });
  };

  const get = (endpoint, params) => {
    return request(endpoint, {
      method: "GET",
      params,
    });
  };

  const post = async (endpoint, data, params) => {
    if (!navigator.onLine) {
      await syncQueue.enqueue({
        method: "POST",
        endpoint,
        body: data,
        params,
      });
      return { offline: true, queued: true };
    }
    return request(endpoint, {
      method: "POST",
      body: data,
      params,
    });
  };

  const put = async (endpoint, data, params) => {
    if (!navigator.onLine) {
      await syncQueue.enqueue({
        method: "PUT",
        endpoint,
        body: data,
        params,
      });
      return { offline: true, queued: true };
    }
    return request(endpoint, {
      method: "PUT",
      body: data,
      params,
    });
  };

  const del = (endpoint) => {
    return request(endpoint, {
      method: "DELETE",
    });
  };

  return {
    get,
    post,
    put,
    delete: del,
    upload,
  };
};
