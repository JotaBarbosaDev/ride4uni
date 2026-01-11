import {api} from "./api.js";

function createChat(payload) {
  return api.post("/chats", payload);
}

function getChatByParticipants(userA, userB) {
  return api.get(`/chats/history/${userA}/${userB}`);
}

function getUserChats(id) {
  return api.get(`/chats/${id}`);
}

function getUsers() {
  return api.get("/users");
}

export {createChat, getChatByParticipants, getUserChats, getUsers};
