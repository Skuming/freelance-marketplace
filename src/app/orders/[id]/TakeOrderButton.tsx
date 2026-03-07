"use client";

import Button from "@mui/joy/Button";
import Typography from "@mui/joy/Typography";
import { BriefcaseBusiness } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const TakeOrderButton = ({ orderId }: { orderId: string }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      {error ? (
        <Typography level="body-sm" color="danger">
          {error}
        </Typography>
      ) : null}
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

          setIsLoading(false);
          router.refresh();
        }}
        startDecorator={<BriefcaseBusiness size={16} />}
      >
        Взять заказ
      </Button>
    </>
  );
};

export default TakeOrderButton;
