"use client";

import Button from "@mui/joy/Button";
import Card from "@mui/joy/Card";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import Stack from "@mui/joy/Stack";
import Textarea from "@mui/joy/Textarea";
import Typography from "@mui/joy/Typography";
import { BadgeDollarSign, Layers, Send } from "lucide-react";
import { useState } from "react";

const NewOrderForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState({
    title: "",
    description: "",
    stack: "",
    budget: "",
  });

  return (
    <Card
      variant="outlined"
      sx={{ borderRadius: "xl", width: "100%", p: 2.25, boxShadow: "sm" }}
    >
      <Stack spacing={0.45} sx={{ mb: 1 }}>
        <Typography level="title-lg">Публикация заказа</Typography>
        <Typography level="body-sm" sx={{ opacity: 0.8 }}>
          Чем конкретнее описание, тем быстрее найдется подходящий исполнитель
        </Typography>
      </Stack>

      <Stack
        component="form"
        spacing={1.25}
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          setIsLoading(true);

          const res = await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: data.title,
              description: data.description,
              stack: data.stack,
              budget: data.budget,
            }),
          });

          const json = await res.json();
          if (!json?.ok) {
            setError(json?.message ?? "Ошибка");
            setIsLoading(false);
            return;
          }

          window.location.href = `/orders/${json.data.id}`;
        }}
      >
        <FormControl>
          <FormLabel>Название</FormLabel>
          <Input
            placeholder="Например: Сверстать лендинг"
            value={data.title}
            onChange={(e) => setData((prev) => ({ ...prev, title: e.target.value }))}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Описание</FormLabel>
          <Textarea
            minRows={6}
            placeholder="Опишите задачу, сроки, желаемый результат..."
            value={data.description}
            onChange={(e) =>
              setData((prev) => ({ ...prev, description: e.target.value }))
            }
          />
        </FormControl>

        <FormControl>
          <FormLabel>Стек</FormLabel>
          <Input
            placeholder="React, Next.js, Prisma"
            startDecorator={<Layers size={16} />}
            value={data.stack}
            onChange={(e) => setData((prev) => ({ ...prev, stack: e.target.value }))}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Бюджет (₽)</FormLabel>
          <Input
            type="number"
            placeholder="15000"
            startDecorator={<BadgeDollarSign size={16} />}
            value={data.budget}
            onChange={(e) => setData((prev) => ({ ...prev, budget: e.target.value }))}
          />
        </FormControl>

        {error ? <Typography color="danger">{error}</Typography> : null}

        <Button
          variant="solid"
          color="primary"
          loading={isLoading}
          type="submit"
          startDecorator={<Send size={16} />}
        >
          Опубликовать
        </Button>
      </Stack>
    </Card>
  );
};

export default NewOrderForm;
