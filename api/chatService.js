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
  console.log("some text");
  return api.get(`/total/count`);
}

export {createChat, getChatByParticipants, getUserChats, getUsers};
