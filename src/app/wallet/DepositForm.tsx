"use client";

import Button from "@mui/joy/Button";
import Input from "@mui/joy/Input";
import { useRouter } from "next/navigation";
import { useState } from "react";

const DepositForm = () => {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="flex gap-2 items-start"
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
      <div className="flex flex-col gap-2 w-full">
        <Input
          placeholder="Сумма пополнения"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        {error ? <p className="text-red-500">{error}</p> : null}
      </div>
      <Button loading={isLoading} type="submit">
        Пополнить
      </Button>
    </form>
  );
};

export default DepositForm;
