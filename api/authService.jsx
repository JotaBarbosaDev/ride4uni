import {api} from './api.jsx';

function login(email, password) {
  return api.post('/auth/login', { email, password });
}

function logout() {
  return api.post('/auth/logout');
}

function getCurrentUser() {
  return api.get('/auth/userid');
}

export { login, logout, getCurrentUser };