import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

let sharedSocket = null;

function getSocket() {
  if (!sharedSocket) {
    const url = import.meta.env.VITE_SERVER_URL || window.location.origin;
    sharedSocket = io(url, {
      transports: ["websocket", "polling"],
    });
  }
  return sharedSocket;
}

export function useSocket() {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    if (socket.connected) setConnected(true);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  return { socket: socketRef.current, connected };
}
