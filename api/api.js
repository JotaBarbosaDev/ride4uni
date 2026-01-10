import axios from 'axios';

axios.defaults.withCredentials = true;

export const api = axios.create({
  baseURL: "https://localhost:3000/api",
});

const redirectToLogin = async () => {
  if (typeof window !== "undefined") {
    if (window.location.pathname !== "/login") {
      window.location.assign("/login");
    }
    return;
  }

  try {
    const { redirect } = await import("next/navigation");
    redirect("/login");
  } catch (err) {
    // Ignore if we're not in a Next.js server context.
  }
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      await redirectToLogin();
    }
    return Promise.reject(error);
  }
);
