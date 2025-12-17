import {api} from "./api.js";

function createMessage(payload) {
  return api.post("/messages", payload);
}

function getMessagesByChatId(chatId) {
  return api.get(`/messages/chat/${chatId}`);
}

export {createMessage, getMessagesByChatId};
