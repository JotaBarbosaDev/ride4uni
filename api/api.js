import axios from 'axios';


export const api = axios.create({
  baseURL: "https://sir-api.maruqes.com/api",
  withCredentials: true,
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
