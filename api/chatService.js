import {api} from "./api.js";

function createChat(payload) {
  return api.post("/chats", payload);
}

function getChatByParticipants(userA, userB) {
  return api.get(`/chats/history/${userA}/${userB}`);
}

function getUserChats() {
  return api.get("/chats");
}

export {createChat, getChatByParticipants, getUserChats};
