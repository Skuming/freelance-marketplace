"use client";

import Button from "@mui/joy/Button";
import Card from "@mui/joy/Card";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import Typography from "@mui/joy/Typography";
import Textarea from "@mui/joy/Textarea";
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
      className="shadow-xs w-full"
      variant="outlined"
      sx={{ borderRadius: 18 }}
    >
      <div className="flex flex-col gap-1">
        <Typography level="h3">Публикация заказа</Typography>
        <Typography level="body-sm" sx={{ opacity: 0.8 }}>
          Опишите задачу, укажите стек и бюджет
        </Typography>
      </div>

      <form
        className="flex flex-col gap-2"
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
            onChange={(e) => setData((p) => ({ ...p, title: e.target.value }))}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Описание</FormLabel>
          <Textarea
            minRows={5}
            placeholder="Подробно опишите, что нужно сделать..."
            value={data.description}
            onChange={(e) =>
              setData((p) => ({ ...p, description: e.target.value }))
            }
          />
        </FormControl>

        <FormControl>
          <FormLabel>Стек</FormLabel>
          <Input
            placeholder="React, Next.js, Prisma"
            value={data.stack}
            onChange={(e) => setData((p) => ({ ...p, stack: e.target.value }))}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Бюджет (₽)</FormLabel>
          <Input
            type="number"
            placeholder="Например: 15000"
            value={data.budget}
            onChange={(e) => setData((p) => ({ ...p, budget: e.target.value }))}
          />
        </FormControl>

        {error ? <Typography color="danger">{error}</Typography> : null}

        <Button
          variant="solid"
          color="primary"
          loading={isLoading}
          type="submit"
        >
          Опубликовать
        </Button>
      </form>
    </Card>
  );
};

export default NewOrderForm;
