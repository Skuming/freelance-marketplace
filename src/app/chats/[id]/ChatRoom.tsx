"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import MessageComposer from "./MessageComposer";

type Message = {
  id: string;
  text: string;
  createdAt: Date | string;
  senderId: string;
  sender: {
    id: string;
    email: string;
    name: string | null;
  };
};

type WsEvent =
  | {
      type: "message";
      chatId: string;
      message: Message;
    }
  | {
      type: "subscribed";
      chatId: string;
    }
  | {
      type: "error";
      message: string;
    };

const ChatRoom = ({
  chatId,
  currentUserId,
  initialMessages,
}: {
  chatId: string;
  currentUserId: string;
  initialMessages: Message[];
}) => {
  const [messages, setMessages] = useState<Message[]>(() => initialMessages);
  const seenMessageIdsRef = useRef<Set<string>>(
    new Set(initialMessages.map((m) => m.id)),
  );
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const addMessage = useCallback((incoming: Message) => {
    setMessages((prev) => {
      if (seenMessageIdsRef.current.has(incoming.id)) {
        return prev;
      }

      seenMessageIdsRef.current.add(incoming.id);
      return [...prev, incoming];
    });
  }, []);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(`${protocol}://${window.location.host}/ws`);

    ws.addEventListener("open", () => {
      ws.send(JSON.stringify({ type: "subscribe", chatId }));
    });

    ws.addEventListener("message", (event) => {
      let payload: WsEvent;
      try {
        payload = JSON.parse(String(event.data)) as WsEvent;
      } catch {
        return;
      }

      if (payload.type === "message" && payload.chatId === chatId) {
        addMessage(payload.message);
      }
    });

    return () => {
      ws.close();
    };
  }, [chatId, addMessage]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  return (
    <>
      <div className="border rounded-lg p-4 flex flex-col gap-2">
        {messages.map((m) => (
          <div
            key={m.id}
            className={m.senderId === currentUserId ? "text-right" : "text-left"}
          >
            <div className="inline-block border rounded-md px-3 py-2 max-w-[80%]">
              <div className="text-sm opacity-70">
                {m.sender.name ?? m.sender.email}
              </div>
              <div>{m.text}</div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <MessageComposer chatId={chatId} onSent={addMessage} />
    </>
  );
};

export default ChatRoom;
