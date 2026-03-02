"use client";

import Button from "@mui/joy/Button";
import Card from "@mui/joy/Card";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import Typography from "@mui/joy/Typography";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

const LoginForm = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<RegData>({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);

  return (
    <Card
      className="shadow-xs w-full"
      variant="outlined"
      sx={{ borderRadius: 18 }}
    >
      <div className="flex flex-col gap-1">
        <Typography level="h3">Вход</Typography>
        <Typography level="body-sm" sx={{ opacity: 0.8 }}>
          Войдите, чтобы видеть заказы и переписываться
        </Typography>
      </div>

      <form
        className="flex flex-col gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          setIsLoading(true);

          const res = await signIn("credentials", {
            email: data.email,
            password: data.password,
            redirect: false,
          });

          if (!res?.ok) {
            setError("Неверный email или пароль");
            setIsLoading(false);
            return;
          }

          window.location.href = "/";
        }}
      >
        <FormControl>
          <FormLabel>Email</FormLabel>
          <Input
            placeholder="mail@example.com"
            type="email"
            value={data.email}
            onChange={(e) =>
              setData((prev) => ({
                email: e.target.value,
                password: prev.password,
              }))
            }
          />
        </FormControl>

        <FormControl>
          <FormLabel>Пароль</FormLabel>
          <Input
            placeholder="••••••••"
            type="password"
            value={data.password}
            onChange={(e) =>
              setData((prev) => ({
                email: prev.email,
                password: e.target.value,
              }))
            }
          />
        </FormControl>

        {error ? <Typography color="danger">{error}</Typography> : null}

        <Button
          variant="solid"
          color="primary"
          loading={isLoading}
          type="submit"
        >
          Войти
        </Button>

        <Typography level="body-sm" sx={{ textAlign: "center" }}>
          Нет аккаунта?{" "}
          <Link className="underline" href="/register">
            Регистрация
          </Link>
        </Typography>
      </form>
    </Card>
  );
};

export default LoginForm;
