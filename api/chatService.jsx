import {api} from "./api.jsx";

function createChat(payload) {
  return api.post("/chats", payload);
}

function getChatByParticipants(userA, userB) {
  return api.get(`/chats/history/${userA}/${userB}`);
}

export {createChat, getChatByParticipants};
