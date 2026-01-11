import { io } from "socket.io-client";


export const socket = io("https://sir-api.maruqes.com", {
  autoConnect: false,
  transports: ["websocket"],
});

/* 🔍 DEBUG / LIFECYCLE LOGS */
socket.on("connect", () => {
  console.log("Estamos no socket", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("saimos do scoket", reason);
});

socket.on("connect_error", (err) => {
  console.log("Socket CONNECT ERROR:", err.message);
});

socket.onAny((event, ...args) => {
  console.log("Socket EVENT:", event, args);
});
