import Header from "@/widgets/header/ui/Header";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@db/prisma";
import Box from "@mui/joy/Box";
import Card from "@mui/joy/Card";
import Chip from "@mui/joy/Chip";
import Container from "@mui/joy/Container";
import Stack from "@mui/joy/Stack";
import Typography from "@mui/joy/Typography";
import { Coins, ShieldCheck, UsersRound } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      wallet: { select: { balance: true } },
    },
  });

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      budget: true,
      stack: true,
      status: true,
      createdAt: true,
      customer: { select: { email: true } },
      freelancer: { select: { email: true } },
    },
  });

  return (
    <Box sx={{ minHeight: "100dvh" }}>
      <Header />
      <Container
        maxWidth="lg"
        sx={{ py: { xs: 2, sm: 3 }, display: "flex", flexDirection: "column", gap: 2 }}
      >
        <Card variant="outlined" sx={{ borderRadius: "xl", p: 2.5 }}>
          <Stack spacing={0.5}>
            <Typography
              level="h1"
              sx={{ fontSize: { xs: "1.6rem", sm: "1.9rem" } }}
              startDecorator={<ShieldCheck size={18} />}
            >
              Админ-панель
            </Typography>
            <Typography level="body-sm" sx={{ opacity: 0.8 }}>
              Управление пользователями и заказами платформы
            </Typography>
          </Stack>
        </Card>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2 }}>
          <Card variant="outlined" sx={{ borderRadius: "xl", p: 2 }}>
            <Stack spacing={1.5}>
              <Typography level="title-lg" startDecorator={<UsersRound size={17} />}>
                Пользователи
              </Typography>
              <Stack spacing={1}>
                {users.map((user) => (
                  <Card key={user.id} variant="soft" color="neutral" sx={{ borderRadius: "lg", p: 1.25 }}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      justifyContent="space-between"
                      spacing={1}
                    >
                      <Stack spacing={0.4}>
                        <Typography level="title-sm">
                          {user.name ? `${user.name} (${user.email})` : user.email}
                        </Typography>
                        <Typography level="body-xs" sx={{ opacity: 0.75 }}>
                          ID: {user.id.slice(0, 8)}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.75}>
                        <Chip size="sm" variant="soft" color="neutral">
                          {user.role}
                        </Chip>
                        <Chip size="sm" variant="soft" color="success">
                          {user.wallet?.balance ?? 0} ₽
                        </Chip>
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </Stack>
          </Card>

          <Card variant="outlined" sx={{ borderRadius: "xl", p: 2 }}>
            <Stack spacing={1.5}>
              <Typography level="title-lg" startDecorator={<Coins size={17} />}>
                Заказы
              </Typography>
              <Stack spacing={1}>
                {orders.map((order) => (
                  <Card key={order.id} variant="soft" color="neutral" sx={{ borderRadius: "lg", p: 1.25 }}>
                    <Stack spacing={0.7}>
                      <Stack direction="row" justifyContent="space-between" spacing={1}>
                        <Typography level="title-sm">{order.title}</Typography>
                        <Chip size="sm" variant="soft" color="primary">
                          {order.status}
                        </Chip>
                      </Stack>
                      <Typography level="body-sm" sx={{ opacity: 0.85 }}>
                        {order.stack} • {order.budget} ₽
                      </Typography>
                      <Typography level="body-xs" sx={{ opacity: 0.75 }}>
                        {order.customer.email}
                        {order.freelancer?.email ? ` -> ${order.freelancer.email}` : " -> без исполнителя"}
                      </Typography>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </Stack>
          </Card>
        </Box>
      </Container>
    </Box>
  );
}
