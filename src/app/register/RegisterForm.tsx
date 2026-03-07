"use client";

import { addUser } from "@/lib/redux/slices/userSlice";
import User from "@/shared/api/user";
import Button from "@mui/joy/Button";
import ButtonGroup from "@mui/joy/ButtonGroup";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import Link from "@mui/joy/Link";
import Stack from "@mui/joy/Stack";
import Typography from "@mui/joy/Typography";
import { AtSign, KeyRound, ShieldUser, UserCheck } from "lucide-react";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useDispatch } from "react-redux";

const RegisterForm = () => {
  const [isCustomer, setIsCustomer] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<RegData>({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();

  return (
    <Stack
      component="form"
      spacing={1.2}
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const reg = await User.create({
          ...data,
          role: isCustomer ? "CUSTOMER" : "FREELANCER",
        });
        if (!reg.ok) {
          setError(reg.message ?? "Ошибка регистрации");
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
          startDecorator={<ShieldUser size={16} />}
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
          startDecorator={<UserCheck size={16} />}
        >
          Фрилансер
        </Button>
      </ButtonGroup>

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

      <Typography level="body-sm" sx={{ textAlign: "center", opacity: 0.9 }}>
        Уже есть аккаунт?{" "}
        <Link href="/login" underline="always">
          Войти
        </Link>
      </Typography>
    </Stack>
  );
};

export default RegisterForm;
