import Axios from "axios";
import { getCookie, setCookie } from "../utils/cookieAuth";

// Axios instance for API calls
export const AuthAxios = Axios.create({
  baseURL: "https://sync-admin.mycliq.tech/api/v1/",
  withCredentials: false,
});

// baseURL: "https://staging.wagesfinance.ng//api/v1/",

// Axios instance for authentication related calls
export const BaseAxios = Axios.create({
  baseURL: "https://sync-admin.mycliq.tech/api/v1/",
  withCredentials: false,
});

let isRefreshing = false;
let refreshSubscribers = [];

// Function to refresh the access token using the refresh token
async function refreshToken() {
  const refreshToken = getCookie("refreshToken");
  if (!refreshToken) {
    console.log("Refresh token is invalid or missing.");
    throw new Error("Refresh token is invalid or missing.");
  }

  try {
    const response = await BaseAxios.post("/auth/refresh-token/", {
      refresh: refreshToken,
    });
    console.log("Token refreshed:", response.data);

    if (response?.data) {
      setCookie("authToken", response?.data?.access); // Make sure the token name is consistent
      return response.data.access;
    }

    throw new Error("Failed to refresh token");
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw error;
  }
}

// Function to add subscribers that will be notified when the token is refreshed
function onAccessTokenFetched(newAccessToken) {
  refreshSubscribers.forEach((callback) => callback(newAccessToken));
  refreshSubscribers = [];
}

// Add request interceptor to include the token in every request
AuthAxios.interceptors.request.use(
  async (config) => {
    const token = getCookie("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle token expiration
AuthAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response: { status } = {} } = error;
    if (status === 401 && !config._retry) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const newAccessToken = await refreshToken();
          isRefreshing = false;
          onAccessTokenFetched(newAccessToken);

          // Update the original request with the new access token and retry
          config.headers["Authorization"] = `Bearer ${newAccessToken}`;
          config._retry = true;
          return AuthAxios(config);
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          isRefreshing = false;
          // Handle failed refresh here (e.g., redirect to login)
          return Promise.reject(refreshError);
        }
      }

      // Wait for the token refresh to complete, then retry the failed request
      return new Promise((resolve) => {
        refreshSubscribers.push((newAccessToken) => {
          config.headers["Authorization"] = `Bearer ${newAccessToken}`;
          resolve(AuthAxios(config));
        });
      });
    }

    return Promise.reject(error);
  }
);

// Usage example
// AuthAxios.get('/some/protected/endpoint').then(response => {
//   console.log(response.data);
// }).catch(error => {
//   console.error('API call error:', error);
// });
