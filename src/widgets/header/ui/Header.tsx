"use client";

import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Container from "@mui/joy/Container";
import Divider from "@mui/joy/Divider";
import IconButton from "@mui/joy/IconButton";
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import ModalDialog from "@mui/joy/ModalDialog";
import Sheet from "@mui/joy/Sheet";
import Stack from "@mui/joy/Stack";
import Typography from "@mui/joy/Typography";
import { useColorScheme } from "@mui/joy/styles";
import {
  LogIn,
  LogOut,
  Menu,
  MoonStar,
  Sun,
  UserPlus,
  Workflow,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import Nav from "./Nav";

const Header = () => {
  const { data: session } = useSession();
  const { mode, setMode } = useColorScheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const isDark = mode === "dark";

  return (
    <>
      <Sheet
        component="header"
        variant="plain"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1200,
          backdropFilter: "blur(10px)",
          backgroundColor:
            "rgba(var(--joy-palette-background-surfaceChannel) / 0.78)",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            minHeight: 68,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.5,
          }}
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <IconButton
              variant="outlined"
              color="neutral"
              onClick={() => setMenuOpen(true)}
              sx={{ display: { xs: "inline-flex", md: "none" } }}
            >
              <Menu size={18} />
            </IconButton>

            <Button
              component={Link}
              href="/"
              variant="plain"
              color="neutral"
              startDecorator={<Workflow size={18} />}
              sx={{
                px: 1,
                fontWeight: 700,
                fontSize: "1rem",
              }}
            >
              Freelancer.com
            </Button>
          </Stack>

          <Box sx={{ display: { xs: "none", md: "block" } }}>
            {session ? <Nav role={session.user.role} /> : null}
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton
              variant="outlined"
              color="neutral"
              onClick={() => setMode(isDark ? "light" : "dark")}
            >
              {isDark ? <Sun size={17} /> : <MoonStar size={17} />}
            </IconButton>

            {session ? (
              <Button
                variant="outlined"
                color="neutral"
                onClick={() => signOut({ callbackUrl: "/login" })}
                startDecorator={<LogOut size={16} />}
              >
                Выйти
              </Button>
            ) : (
              <Stack direction="row" spacing={1}>
                <Button
                  component={Link}
                  href="/login"
                  variant="outlined"
                  color="neutral"
                  startDecorator={<LogIn size={16} />}
                >
                  Войти
                </Button>
                <Button
                  component={Link}
                  href="/register"
                  variant="solid"
                  color="primary"
                  startDecorator={<UserPlus size={16} />}
                >
                  Регистрация
                </Button>
              </Stack>
            )}
          </Stack>
        </Container>
      </Sheet>

      <Modal open={menuOpen} onClose={() => setMenuOpen(false)}>
        <ModalDialog
          sx={{
            maxWidth: 420,
            width: "calc(100% - 32px)",
            borderRadius: "xl",
            p: 0,
            overflow: "hidden",
          }}
        >
          <Sheet
            variant="soft"
            sx={{
              p: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography level="title-md">Навигация</Typography>
            <ModalClose />
          </Sheet>
          <Divider />
          <Box sx={{ p: 1.5 }}>
            {session ? (
              <Nav
                role={session.user.role}
                mobile
                onNavigate={() => setMenuOpen(false)}
              />
            ) : (
              <Stack spacing={1}>
                <Button
                  component={Link}
                  href="/login"
                  variant="outlined"
                  color="neutral"
                  startDecorator={<LogIn size={16} />}
                  onClick={() => setMenuOpen(false)}
                >
                  Войти
                </Button>
                <Button
                  component={Link}
                  href="/register"
                  variant="solid"
                  color="primary"
                  startDecorator={<UserPlus size={16} />}
                  onClick={() => setMenuOpen(false)}
                >
                  Регистрация
                </Button>
              </Stack>
            )}
          </Box>
        </ModalDialog>
      </Modal>
    </>
  );
};

export default Header;
