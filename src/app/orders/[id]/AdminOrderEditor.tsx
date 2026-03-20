"use client";

import Button from "@mui/joy/Button";
import Card from "@mui/joy/Card";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import Option from "@mui/joy/Option";
import Select from "@mui/joy/Select";
import Stack from "@mui/joy/Stack";
import Textarea from "@mui/joy/Textarea";
import Typography from "@mui/joy/Typography";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type OrderStatus = "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELED";

type FreelancerOption = {
  id: string;
  email: string;
  name: string | null;
};

const statusOptions: OrderStatus[] = [
  "OPEN",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELED",
];

export default function AdminOrderEditor({
  orderId,
  initialTitle,
  initialDescription,
  initialStack,
  initialBudget,
  initialStatus,
  initialFreelancerId,
  freelancers,
}: {
  orderId: string;
  initialTitle: string;
  initialDescription: string;
  initialStack: string;
  initialBudget: number;
  initialStatus: OrderStatus;
  initialFreelancerId: string | null;
  freelancers: FreelancerOption[];
}) {
  const router = useRouter();

  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [stack, setStack] = useState(initialStack);
  const [budget, setBudget] = useState(String(initialBudget));
  const [status, setStatus] = useState<OrderStatus>(initialStatus);
  const [freelancerId, setFreelancerId] = useState(initialFreelancerId ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  return (
    <Card variant="outlined" sx={{ borderRadius: "xl", p: 2 }}>
      <Stack
        component="form"
        spacing={1.2}
        onSubmit={async (event) => {
          event.preventDefault();
          setError(null);
          setSuccess(null);

          const parsedBudget = Number.parseInt(budget, 10);
          if (!Number.isFinite(parsedBudget) || parsedBudget <= 0) {
            setError("Бюджет должен быть положительным числом");
            return;
          }

          setIsLoading(true);

          try {
            const url = "/api/orders/" + encodeURIComponent(orderId);
            const response = await fetch(url, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title,
                description,
                stack,
                budget: parsedBudget,
                status,
                freelancerId: freelancerId || null,
              }),
            });

            const payload = await response.json();

            if (!response.ok || !payload?.ok) {
              setError(payload?.message ?? "Не удалось изменить заказ");
              setIsLoading(false);
              return;
            }

            setSuccess("Заказ обновлен");
            router.refresh();
          } catch {
            setError("Ошибка сети");
          } finally {
            setIsLoading(false);
          }
        }}
      >
        <Typography level="title-lg">Редактирование заказа (ADMIN)</Typography>

        <FormControl>
          <FormLabel>Название</FormLabel>
          <Input value={title} onChange={(event) => setTitle(event.target.value)} />
        </FormControl>

        <FormControl>
          <FormLabel>Описание</FormLabel>
          <Textarea
            minRows={5}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Стек</FormLabel>
          <Input value={stack} onChange={(event) => setStack(event.target.value)} />
        </FormControl>

        <FormControl>
          <FormLabel>Бюджет</FormLabel>
          <Input
            type="number"
            value={budget}
            onChange={(event) => setBudget(event.target.value)}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Статус</FormLabel>
          <Select
            value={status}
            onChange={(_, value) => {
              if (value) {
                setStatus(value as OrderStatus);
              }
            }}
          >
            {statusOptions.map((item) => (
              <Option key={item} value={item}>
                {item}
              </Option>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Исполнитель</FormLabel>
          <Select
            value={freelancerId}
            onChange={(_, value) => {
              setFreelancerId(value ?? "");
            }}
          >
            <Option value="">Не назначен</Option>
            {freelancers.map((item) => (
              <Option key={item.id} value={item.id}>
                {item.name ? `${item.name} (${item.email})` : item.email}
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
          Сохранить изменения
        </Button>
      </Stack>
    </Card>
  );
}
