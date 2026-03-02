"use client";

import Button from "@mui/joy/Button";
import Input from "@mui/joy/Input";
import { useRouter } from "next/navigation";
import { useState } from "react";

const MessageComposer = ({ chatId }: { chatId: string }) => {
  const router = useRouter();
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="flex gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        const t = text.trim();
        if (!t) return;

        setIsLoading(true);
        const res = await fetch(`/api/chats/${chatId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: t }),
        });
        const json = await res.json();
        if (!json?.ok) {
          setError(json?.message ?? "Ошибка");
          setIsLoading(false);
          return;
        }

        setText("");
        setIsLoading(false);
        router.refresh();
      }}
    >
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Сообщение..."
        sx={{ flex: 1 }}
      />
      <Button loading={isLoading} type="submit">
        Отправить
      </Button>
      {error ? <p className="text-red-500">{error}</p> : null}
    </form>
  );
};

export default MessageComposer;
