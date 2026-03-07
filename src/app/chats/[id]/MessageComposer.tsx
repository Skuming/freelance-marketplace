"use client";

import Button from "@mui/joy/Button";
import Card from "@mui/joy/Card";
import Input from "@mui/joy/Input";
import Stack from "@mui/joy/Stack";
import Typography from "@mui/joy/Typography";
import { SendHorizonal } from "lucide-react";
import { useState } from "react";

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

const MessageComposer = ({
  chatId,
  onSent,
}: {
  chatId: string;
  onSent?: (message: Message) => void;
}) => {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Card
      variant="outlined"
      component="form"
      sx={{ borderRadius: "xl", p: 1.25 }}
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        const trimmed = text.trim();
        if (!trimmed) return;

        setIsLoading(true);
        const res = await fetch(`/api/chats/${chatId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: trimmed }),
        });
        const json = await res.json();

        if (!json?.ok) {
          setError(json?.message ?? "Ошибка отправки");
          setIsLoading(false);
          return;
        }

        if (json?.data) {
          onSent?.(json.data as Message);
        }

        setText("");
        setIsLoading(false);
      }}
    >
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="stretch">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Сообщение..."
          sx={{ flex: 1 }}
        />
        <Button
          loading={isLoading}
          type="submit"
          startDecorator={<SendHorizonal size={16} />}
          disabled={!text.trim()}
        >
          Отправить
        </Button>
      </Stack>
      {error ? (
        <Typography level="body-sm" color="danger" sx={{ mt: 1 }}>
          {error}
        </Typography>
      ) : null}
    </Card>
  );
};

export default MessageComposer;
