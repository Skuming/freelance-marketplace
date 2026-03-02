"use client";

import { addUser } from "@/lib/redux/slices/userSlice";
import User from "@/shared/api/user";
import Button from "@mui/joy/Button";
import ButtonGroup from "@mui/joy/ButtonGroup";
import Card from "@mui/joy/Card";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import Typography from "@mui/joy/Typography";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { useDispatch } from "react-redux";

const RegisterForm = () => {
  const [isCustomer, setIsCustomer] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<RegData>({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();

  return (
    <Card
      className="shadow-xs w-full"
      variant="outlined"
      sx={{ borderRadius: 18 }}
    >
      <div className="flex flex-col gap-1">
        <Typography level="h3">Регистрация</Typography>
        <Typography level="body-sm" sx={{ opacity: 0.8 }}>
          Выберите роль и создайте аккаунт
        </Typography>
      </div>

      <form
        className="flex flex-col gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          setIsLoading(true);

          const reg = await User.create({
            ...data,
            role: isCustomer ? "CUSTOMER" : "FREELANCER",
          });
          if (!reg.ok) {
            setError(reg.message ?? "Ошибка");
            setIsLoading(false);
            return;
          }

          if (reg.data) {
            const sign = await signIn("credentials", {
              email: data.email,
              password: data.password,
              redirect: false,
            });
            dispatch(addUser(reg.data));
            if (sign?.ok) {
              window.location.href = "/";
              return;
            }
          }

          setIsLoading(false);
        }}
      >
        <ButtonGroup>
          <Button
            sx={{ width: "100%" }}
            onClick={(e) => {
              e.preventDefault();
              setIsCustomer(true);
            }}
            variant={isCustomer ? "solid" : "outlined"}
            color="primary"
          >
            Заказчик
          </Button>
          <Button
            sx={{ width: "100%" }}
            onClick={(e) => {
              e.preventDefault();
              setIsCustomer(false);
            }}
            variant={!isCustomer ? "solid" : "outlined"}
            color="primary"
          >
            Фрилансер
          </Button>
        </ButtonGroup>

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
            onChange={(e) => {
              setData((prev) => ({
                email: prev.email,
                password: e.target.value,
              }));
            }}
          />
        </FormControl>

        {error ? <Typography color="danger">{error}</Typography> : null}

        <Button
          variant="solid"
          color="primary"
          loading={isLoading}
          type="submit"
        >
          Создать аккаунт
        </Button>

        <Typography level="body-sm" sx={{ textAlign: "center" }}>
          Уже есть аккаунт?{" "}
          <Link className="underline" href="/login">
            Войти
          </Link>
        </Typography>
      </form>
    </Card>
  );
};

export default RegisterForm;
