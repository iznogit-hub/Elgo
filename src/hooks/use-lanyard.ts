import { useEffect, useState } from "react";
import { LanyardData, LanyardMessage } from "@/app/types/lanyard";

const LANYARD_WS = "wss://api.lanyard.rest/socket";

export function useLanyard(discordId: string) {
  const [data, setData] = useState<LanyardData | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!discordId) return;

    let socket: WebSocket | null = null;
    let heartbeatInterval: NodeJS.Timeout | null = null;

    const connect = () => {
      socket = new WebSocket(LANYARD_WS);

      socket.onopen = () => {
        setIsConnected(true);
      };

      socket.onmessage = (event) => {
        const message: LanyardMessage = JSON.parse(event.data);

        switch (message.op) {
          case 1: // Hello - Send Identify and start heartbeat
            // Send Identify safely
            if (socket?.readyState === WebSocket.OPEN) {
              socket.send(
                JSON.stringify({
                  op: 2,
                  d: { subscribe_to_id: discordId },
                })
              );
            }

            // Start Heartbeat (every 30s)
            // @ts-expect-error - The message.d for OP 1 has a heartbeat_interval
            const interval = message.d.heartbeat_interval || 30000;
            heartbeatInterval = setInterval(() => {
              if (socket?.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ op: 3 }));
              }
            }, interval);
            break;

          case 0: // Event Dispatch
            if (message.t === "INIT_STATE" || message.t === "PRESENCE_UPDATE") {
              setData(message.d);
            }
            break;
        }
      };

      socket.onclose = () => {
        setIsConnected(false);
        if (heartbeatInterval) clearInterval(heartbeatInterval);
        // Try to reconnect after 5s
        setTimeout(connect, 5000);
      };
    };

    connect();

    return () => {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      socket?.close();
    };
  }, [discordId]);

  return { data, isConnected };
}
