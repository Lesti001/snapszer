import { io } from "socket.io-client";

const socket = io(window.location.origin, {
  autoConnect: false,
  reconnection: false
});

export default socket;