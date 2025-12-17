import {api} from "./api.js";

function createUser(payload) {
  return api.post("/users", payload);
}

function getUsers() {
  return api.get("/users");
}

function getUserByEmail(email) {
  return api.get(`/users/${email}`);
}

function getUserByID(id) {
  return api.get(`/users/id/${id}`);
}

function deleteUser(id) {
  return api.delete(`/users/id/${id}`);
}

function updateUser(id, payload) {
  return api.put(`/users/id/${id}`, payload);
}

function getTotalUsers() {
  return api.get(`/users/total/count`);
}
export {
  createUser,
  getUsers,
  getUserByEmail,
  getUserByID,
  deleteUser,
  updateUser,
  getTotalUsers,
};
