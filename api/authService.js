import {api} from './api.js';
import { socket } from "../Service/socket.js";

async function login(email, password) {
  const response = await api.post("/auth/login", { email, password });

  if (response.data) {
    const token = response.data.token; 

    socket.auth = { token };

    if (!socket.connected) {
      socket.connect();
    }
  }

  return response;
}


async function logout() {
  try {
    await api.post("/auth/logout");
  } finally {
    socket.disconnect();

    if (typeof window !== "undefined") {
      window.localStorage.removeItem("socketToken");
    }
    
  }
}

function getToken() {
  return api.get('/auth/token');
}

function getCurrentUser() {
  return api.get('/auth/userid');
}

export { login, logout, getCurrentUser ,getToken};
