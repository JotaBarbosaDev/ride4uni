import axios from 'axios';

axios.defaults.withCredentials = true;

export const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 && typeof window !== "undefined") {
      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  }
);
