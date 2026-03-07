"use client";

import Button from "@mui/joy/Button";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import Stack from "@mui/joy/Stack";
import Typography from "@mui/joy/Typography";
import { Save, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const ProfileForm = ({ initialName }: { initialName: string | null }) => {
  const router = useRouter();
  const [name, setName] = useState(initialName ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Stack
      component="form"
      spacing={1.2}
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
          setError(json?.message ?? "Ошибка сохранения");
          setIsLoading(false);
          return;
        }

        setIsLoading(false);
        router.refresh();
      }}
    >
      <FormControl>
        <FormLabel>Имя</FormLabel>
        <Input
          placeholder="Введите имя"
          startDecorator={<UserRound size={16} />}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </FormControl>
      {error ? <Typography color="danger">{error}</Typography> : null}
      <Button loading={isLoading} type="submit" startDecorator={<Save size={16} />}>
        Сохранить
      </Button>
    </Stack>
  );
};

export default ProfileForm;
