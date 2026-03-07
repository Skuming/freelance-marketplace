import { createServer } from "node:http";
import { parse } from "node:url";
import next from "next";
import { WebSocket, WebSocketServer } from "ws";

const dev = process.argv.includes("--dev");
process.env.NODE_ENV = dev ? "development" : "production";

const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = Number.parseInt(process.env.PORT || "3000", 10);
const internalApiBase =
  process.env.INTERNAL_API_BASE_URL || `http://127.0.0.1:${port}`;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

/** @type {Map<string, Set<import("ws").WebSocket>>} */
const chatRooms = new Map();

function removeSocketFromRoom(ws) {
  const chatId = ws.chatId;
  if (!chatId) return;

  const room = chatRooms.get(chatId);
  if (!room) {
    ws.chatId = undefined;
    return;
  }

  room.delete(ws);
  if (room.size === 0) {
    chatRooms.delete(chatId);
  }
  ws.chatId = undefined;
}

function addSocketToRoom(chatId, ws) {
  removeSocketFromRoom(ws);

  const room = chatRooms.get(chatId) ?? new Set();
  room.add(ws);
  chatRooms.set(chatId, room);
  ws.chatId = chatId;
}

function broadcastToChat(chatId, payload) {
  const room = chatRooms.get(chatId);
  if (!room || room.size === 0) return;

  const serialized = JSON.stringify(payload);
  for (const client of room) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(serialized);
    }
  }
}

globalThis.__chatBroadcast = broadcastToChat;

app.prepare().then(() => {
  const upgradeHandler =
    typeof app.getUpgradeHandler === "function"
      ? app.getUpgradeHandler()
      : null;

  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url || "", true);
    handle(req, res, parsedUrl);
  });

  const wss = new WebSocketServer({ noServer: true });

  wss.on("connection", (ws, req) => {
    const cookie = req.headers.cookie ?? "";

    ws.on("message", async (raw) => {
      let event;
      try {
        event = JSON.parse(raw.toString("utf-8"));
      } catch {
        ws.send(JSON.stringify({ type: "error", message: "Invalid payload" }));
        return;
      }

      if (
        event?.type !== "subscribe" ||
        typeof event?.chatId !== "string" ||
        !event.chatId.trim()
      ) {
        ws.send(JSON.stringify({ type: "error", message: "Invalid payload" }));
        return;
      }

      const chatId = event.chatId.trim();

      try {
        const authResponse = await fetch(
          `${internalApiBase}/api/chats/${encodeURIComponent(chatId)}`,
          {
            method: "GET",
            headers: {
              cookie,
              accept: "application/json",
            },
          },
        );

        if (!authResponse.ok) {
          ws.send(JSON.stringify({ type: "error", message: "Forbidden" }));
          ws.close(1008, "Forbidden");
          return;
        }
      } catch {
        ws.send(JSON.stringify({ type: "error", message: "Auth failed" }));
        ws.close(1011, "Auth failed");
        return;
      }

      addSocketToRoom(chatId, ws);
      ws.send(JSON.stringify({ type: "subscribed", chatId }));
    });

    ws.on("close", () => {
      removeSocketFromRoom(ws);
    });

    ws.on("error", () => {
      removeSocketFromRoom(ws);
    });
  });

  server.on("upgrade", (req, socket, head) => {
    const pathname = parse(req.url || "").pathname;

    if (pathname === "/ws") {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req);
      });
      return;
    }

    if (upgradeHandler) {
      upgradeHandler(req, socket, head);
      return;
    }

    socket.destroy();
  });

  server.listen(port, hostname, () => {
    console.log(`> Server ready on http://${hostname}:${port}`);
  });
});
