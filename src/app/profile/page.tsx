import Header from "@/widgets/header/ui/Header";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@db/prisma";
import Box from "@mui/joy/Box";
import Card from "@mui/joy/Card";
import Chip from "@mui/joy/Chip";
import Container from "@mui/joy/Container";
import Stack from "@mui/joy/Stack";
import Typography from "@mui/joy/Typography";
import { CircleUserRound, Wallet } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      wallet: { select: { balance: true } },
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <Box sx={{ minHeight: "100dvh" }}>
      <Header />
      <Container
        maxWidth="md"
        sx={{ py: { xs: 2, sm: 3 }, display: "flex", flexDirection: "column", gap: 2 }}
      >
        <Card variant="outlined" sx={{ borderRadius: "xl", p: 2.25 }}>
          <Typography
            level="h1"
            sx={{ fontSize: { xs: "1.55rem", sm: "1.85rem" } }}
            startDecorator={<CircleUserRound size={18} />}
          >
            Профиль
          </Typography>
          <Typography level="body-sm" sx={{ opacity: 0.8, mt: 0.5 }}>
            Личные данные и настройки аккаунта
          </Typography>
        </Card>

        <Card variant="outlined" sx={{ borderRadius: "xl", p: 2 }}>
          <Stack spacing={1.1}>
            <Typography level="title-md">Данные аккаунта</Typography>
            <Card variant="soft" color="neutral" sx={{ borderRadius: "lg", p: 1.25 }}>
              <Stack spacing={0.5}>
                <Typography level="body-sm" sx={{ opacity: 0.75 }}>
                  Email
                </Typography>
                <Typography level="title-sm">{user.email}</Typography>
              </Stack>
            </Card>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Card variant="soft" color="neutral" sx={{ borderRadius: "lg", p: 1.25, flex: 1 }}>
                <Typography level="body-sm" sx={{ opacity: 0.75 }}>
                  Роль
                </Typography>
                <Chip size="sm" variant="soft" color="primary" sx={{ mt: 0.7, width: "fit-content" }}>
                  {user.role}
                </Chip>
              </Card>
              <Card variant="soft" color="neutral" sx={{ borderRadius: "lg", p: 1.25, flex: 1 }}>
                <Typography level="body-sm" sx={{ opacity: 0.75 }}>
                  Баланс
                </Typography>
                <Typography component="div" level="title-sm" sx={{ mt: 0.7 }}>
                  <Stack direction="row" spacing={0.6} alignItems="center">
                    <Wallet size={15} />
                    <span>{user.wallet?.balance ?? 0} ₽</span>
                  </Stack>
                </Typography>
              </Card>
            </Stack>
          </Stack>
        </Card>

        <Card variant="outlined" sx={{ borderRadius: "xl", p: 2 }}>
          <Typography level="title-md" sx={{ mb: 1 }}>
            Настройки профиля
          </Typography>
          <ProfileForm initialName={user.name} />
        </Card>
      </Container>
    </Box>
  );
}
