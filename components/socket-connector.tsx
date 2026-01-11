"use client";

import {useEffect} from "react";
import {socket} from "@/Service/socket.js";
import {getToken} from "@/api/authService.js";

export function SocketConnector() {
  useEffect(() => {
    let isMounted = true;
    const connect = async () => {
      if (socket.connected) return;
      try {
        const res = await getToken();
        if (isMounted && res?.data?.token) {
          socket.auth = {token: res.data.token};
        }
      } catch (_err) {
        // Ignore token fetch failures and still attempt to connect.
      }
      if (isMounted && !socket.connected) {
        socket.connect();
      }
    };

    connect();
    return () => {
      isMounted = false;
    };
  }, []);

  return null;
}
