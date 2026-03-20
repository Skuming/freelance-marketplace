"use client";

import Box from "@mui/joy/Box";
import Card from "@mui/joy/Card";
import Sheet from "@mui/joy/Sheet";
import Stack from "@mui/joy/Stack";
import Typography from "@mui/joy/Typography";
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

type ChatPayload = {
  messages?: Message[];
};

type ChatApiResponse = {
  ok?: boolean;
  data?: ChatPayload;
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
  const containerRef = useRef<HTMLDivElement | null>(null);

  const addMessage = useCallback((incoming: Message) => {
    setMessages((prev) => {
      if (seenMessageIdsRef.current.has(incoming.id)) {
        return prev;
      }

      seenMessageIdsRef.current.add(incoming.id);
      return [...prev, incoming];
    });
  }, []);

  const syncMessages = useCallback(async () => {
    try {
      const url = "/api/chats/" + encodeURIComponent(chatId);
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return;

      const payload = (await res.json()) as ChatApiResponse;
      const incoming = payload?.data?.messages;

      if (!Array.isArray(incoming)) return;

      for (const message of incoming) {
        addMessage(message);
      }
    } catch {
      // Silent fail: polling will retry on next interval.
    }
  }, [chatId, addMessage]);

  useEffect(() => {
    void syncMessages();

    const intervalId = window.setInterval(() => {
      void syncMessages();
    }, 3000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [syncMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  return (
    <Stack spacing={1.5}>
      <Card variant="outlined" sx={{ borderRadius: "xl", p: 1.25 }}>
        <Box
          ref={containerRef}
          sx={{
            maxHeight: "62dvh",
            minHeight: { xs: 260, sm: 320, md: 380 },
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 1,
            px: { xs: 0.25, sm: 0.5 },
            py: 0.5,
          }}
        >
          {messages.map((message) => {
            const mine = message.senderId === currentUserId;

            return (
              <Stack
                key={message.id}
                direction="column"
                alignItems={mine ? "flex-end" : "flex-start"}
                spacing={0.45}
              >
                <Sheet
                  variant={mine ? "solid" : "soft"}
                  color={mine ? "primary" : "neutral"}
                  sx={{
                    px: 1.25,
                    py: 0.85,
                    borderRadius: "lg",
                    maxWidth: "80%",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  <Typography level="body-xs" sx={{ opacity: 0.78, mb: 0.35 }}>
                    {message.sender.name ?? message.sender.email}
                  </Typography>
                  <Typography level="body-sm">{message.text}</Typography>
                </Sheet>
                <Typography level="body-xs" sx={{ opacity: 0.62 }}>
                  {new Date(message.createdAt).toLocaleString("ru-RU")}
                </Typography>
              </Stack>
            );
          })}
          <div ref={bottomRef} />
        </Box>
      </Card>

      <MessageComposer chatId={chatId} onSent={addMessage} />
    </Stack>
  );
};

export default ChatRoom;
