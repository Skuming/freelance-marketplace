"use client";

import Button from "@mui/joy/Button";
import { useState } from "react";

const TakeOrderButton = ({ orderId }: { orderId: string }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2">
      {error ? <p className="text-red-500">{error}</p> : null}
      <Button
        loading={isLoading}
        variant="solid"
        onClick={async () => {
          setError(null);
          setIsLoading(true);
          const res = await fetch(`/api/orders/${orderId}`, {
            method: "PATCH",
          });
          const json = await res.json();
          if (!json?.ok) {
            setError(json?.message ?? "Ошибка");
            setIsLoading(false);
            return;
          }

          window.location.reload();
        }}
      >
        Взять заказ
      </Button>
    </div>
  );
};

export default TakeOrderButton;
