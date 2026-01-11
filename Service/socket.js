import { io } from "socket.io-client";


export const socket = io("https://sir-api.maruqes.com", {
  autoConnect: false,
  transports: ["websocket"],
});

/* 🔍 DEBUG / LIFECYCLE LOGS */
socket.on("connect", () => {
  console.log("Socket CONNECTED:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("Socket DISCONNECTED:", reason);
});

socket.on("connect_error", (err) => {
  console.log("Socket CONNECT ERROR:", err.message);
});