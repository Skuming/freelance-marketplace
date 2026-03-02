"use client";

import Button from "@mui/joy/Button";
import Input from "@mui/joy/Input";
import { useRouter } from "next/navigation";
import { useState } from "react";

const ProfileForm = ({ initialName }: { initialName: string | null }) => {
  const router = useRouter();
  const [name, setName] = useState(initialName ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const res = await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
        const json = await res.json();

        if (!json?.ok) {
          setError(json?.message ?? "Ошибка");
          setIsLoading(false);
          return;
        }

        setIsLoading(false);
        router.refresh();
      }}
    >
      <Input
        placeholder="Имя"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      {error ? <p className="text-red-500">{error}</p> : null}
      <Button loading={isLoading} type="submit">
        Сохранить
      </Button>
    </form>
  );
};

export default ProfileForm;
