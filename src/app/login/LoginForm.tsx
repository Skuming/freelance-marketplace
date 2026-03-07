"use client";

import Button from "@mui/joy/Button";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import Link from "@mui/joy/Link";
import Stack from "@mui/joy/Stack";
import Typography from "@mui/joy/Typography";
import { AtSign, KeyRound, LogIn } from "lucide-react";
import { signIn } from "next-auth/react";
import { useState } from "react";

const LoginForm = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<RegData>({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);

  return (
    <Stack
      component="form"
      spacing={1.2}
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
          startDecorator={<AtSign size={16} />}
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
          startDecorator={<KeyRound size={16} />}
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
        startDecorator={<LogIn size={16} />}
      >
        Войти
      </Button>

      <Typography level="body-sm" sx={{ textAlign: "center", opacity: 0.9 }}>
        Нет аккаунта?{" "}
        <Link href="/register" underline="always">
          Зарегистрироваться
        </Link>
      </Typography>
    </Stack>
  );
};

export default LoginForm;
