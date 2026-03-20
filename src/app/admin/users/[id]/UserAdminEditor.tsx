"use client";

import Button from "@mui/joy/Button";
import Card from "@mui/joy/Card";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import Option from "@mui/joy/Option";
import Select from "@mui/joy/Select";
import Stack from "@mui/joy/Stack";
import Typography from "@mui/joy/Typography";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Role = "FREELANCER" | "CUSTOMER" | "ADMIN";

const availableRoles: Role[] = ["ADMIN", "CUSTOMER", "FREELANCER"];

export default function UserAdminEditor({
  userId,
  initialName,
  initialRole,
}: {
  userId: string;
  initialName: string | null;
  initialRole: Role;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName ?? "");
  const [role, setRole] = useState<Role>(initialRole);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  return (
    <Card variant="outlined" sx={{ borderRadius: "xl", p: 1.5 }}>
      <Stack
        component="form"
        spacing={1.2}
        onSubmit={async (event) => {
          event.preventDefault();
          setError(null);
          setSuccess(null);
          setIsLoading(true);

          try {
            const url = "/api/admin/users/" + encodeURIComponent(userId);
            const response = await fetch(url, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: name.trim() || null,
                role,
              }),
            });

            const payload = await response.json();

            if (!response.ok || !payload?.ok) {
              setError(payload?.message ?? "Не удалось обновить пользователя");
              setIsLoading(false);
              return;
            }

            setSuccess("Пользователь обновлен");
            router.refresh();
          } catch {
            setError("Ошибка сети");
          } finally {
            setIsLoading(false);
          }
        }}
      >
        <Typography level="title-md">Редактировать пользователя</Typography>

        <FormControl>
          <FormLabel>Имя</FormLabel>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Имя пользователя"
          />
        </FormControl>

        <FormControl>
          <FormLabel>Роль</FormLabel>
          <Select
            value={role}
            onChange={(_, value) => {
              if (value) {
                setRole(value as Role);
              }
            }}
          >
            {availableRoles.map((item) => (
              <Option key={item} value={item}>
                {item}
              </Option>
            ))}
          </Select>
        </FormControl>

        {error ? <Typography color="danger">{error}</Typography> : null}
        {success ? <Typography color="success">{success}</Typography> : null}

        <Button
          type="submit"
          loading={isLoading}
          startDecorator={<Save size={16} />}
        >
          Сохранить
        </Button>
      </Stack>
    </Card>
  );
}
