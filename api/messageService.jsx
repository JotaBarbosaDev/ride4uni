import {api} from "./api.jsx";

function createMessage(payload) {
  return api.post("/messages", payload);
}

function getMessagesByChatId(chatId) {
  return api.get(`/messages/chat/${chatId}`);
}

export {createMessage, getMessagesByChatId};
