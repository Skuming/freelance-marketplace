"use client";

import Button from "@mui/joy/Button";
import Input from "@mui/joy/Input";
import Stack from "@mui/joy/Stack";
import Typography from "@mui/joy/Typography";
import { BadgeDollarSign, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const DepositForm = () => {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Stack
      component="form"
      direction={{ xs: "column", sm: "row" }}
      spacing={1}
      alignItems={{ xs: "stretch", sm: "flex-start" }}
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const res = await fetch("/api/wallet/deposit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount }),
        });

        const json = await res.json();
        if (!json?.ok) {
          setError(json?.message ?? "Ошибка");
          setIsLoading(false);
          return;
        }

        setAmount("");
        setIsLoading(false);
        router.refresh();
      }}
    >
      <Stack spacing={0.8} sx={{ width: "100%" }}>
        <Input
          placeholder="Сумма пополнения"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          startDecorator={<BadgeDollarSign size={16} />}
        />
        {error ? <Typography color="danger">{error}</Typography> : null}
      </Stack>
      <Button
        loading={isLoading}
        type="submit"
        startDecorator={<PlusCircle size={16} />}
      >
        Пополнить
      </Button>
    </Stack>
  );
};

export default DepositForm;
