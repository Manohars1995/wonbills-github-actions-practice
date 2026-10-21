import axios from "axios";

let logoutFromContext = null;

/* ---------------- REGISTER LOGOUT HANDLER ---------------- */
export const registerLogoutFunction = (fn) => {
  logoutFromContext = fn;
};

/* ---------------- PUBLIC ROUTES ---------------- */
const isPublicPath = (path) => {
  return ["/", "/home", "/privacy-policy", "/signin", "/signup"].some((p) =>
    path.startsWith(p)
  );
};

/* ---------------- AXIOS INSTANCE ---------------- */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true
});

/* ---------------- REQUEST INTERCEPTOR ---------------- */
api.interceptors.request.use(
  (config) => {
    // Avoid forcing JSON header for downloads / FormData
    if (
      config.data &&
      !(config.data instanceof FormData) &&
      !config.isDownload
    ) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ---------------- REFRESH STATE ---------------- */
let isRefreshing = false;

/* ---------------- RESPONSE INTERCEPTOR ---------------- */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error?.config) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    /* ---------------- HANDLE ACCESS TOKEN EXPIRY ---------------- */
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh-token")
    ) {
      if (isRefreshing) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post("/auth/refresh-token");
        isRefreshing = false;

        // Retry original request after successful refresh
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;

        console.warn("Refresh token expired. Logging out.");

        const currentPath = window.location.pathname;

        if (!isPublicPath(currentPath)) {
          // Clear app state + redirect (handled by Auth Context)
          logoutFromContext?.();
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
