"use client";

import Button from "@mui/joy/Button";
import Card from "@mui/joy/Card";
import IconButton from "@mui/joy/IconButton";
import { useColorScheme } from "@mui/joy/styles";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Nav from "./Nav";
import { useState } from "react";

const Header = () => {
  const { data: session } = useSession();
  const { mode, setMode } = useColorScheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="sticky top-0 z-50">
      <div
        className="w-full backdrop-blur-md"
        style={{
          backgroundColor:
            "rgba(var(--joy-palette-background-surfaceChannel) / 0.72)",
          borderBottom:
            "1px solid rgba(var(--joy-palette-neutral-outlinedBorderChannel) / 0.35)",
        }}
      >
        <div className="max-w-6xl mx-auto h-16 px-4 sm:px-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <IconButton
              variant="outlined"
              className="md:hidden"
              onClick={() => setMenuOpen((v) => !v)}
            >
              Menu
            </IconButton>
            <Link href="/" className="font-semibold">
              Freelancer.com
            </Link>
          </div>

          <div className="hidden md:block">
            {session ? <Nav role={session.user.role} /> : <div />}
          </div>

          <div className="flex items-center gap-2">
            <IconButton
              variant="outlined"
              onClick={() => setMode(mode === "dark" ? "light" : "dark")}
            >
              {mode === "dark" ? "Dark" : "Light"}
            </IconButton>
            {session ? (
              <Button
                variant="outlined"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                Выйти
              </Button>
            ) : (
              <>
                <Button variant="outlined" component={Link} href="/login">
                  Войти
                </Button>
                <Button variant="solid" component={Link} href="/register">
                  Регистрация
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {menuOpen ? (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute top-20 left-4 right-4">
            <Card
              className="shadow-xs"
              variant="outlined"
              sx={{ borderRadius: 18 }}
            >
              <div className="flex flex-col gap-2">
                <Link
                  href="/"
                  onClick={() => setMenuOpen(false)}
                  className="py-2"
                >
                  Заказы
                </Link>
                <Link
                  href="/chats"
                  onClick={() => setMenuOpen(false)}
                  className="py-2"
                >
                  Чаты
                </Link>
                <Link
                  href="/wallet"
                  onClick={() => setMenuOpen(false)}
                  className="py-2"
                >
                  Кошелёк
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="py-2"
                >
                  Профиль
                </Link>
                {session?.user?.role === "ADMIN" ? (
                  <Link
                    href="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="py-2"
                  >
                    Админ
                  </Link>
                ) : null}
              </div>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Header;
