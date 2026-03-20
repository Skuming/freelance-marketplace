import Header from "@/widgets/header/ui/Header";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@db/prisma";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Card from "@mui/joy/Card";
import Chip from "@mui/joy/Chip";
import Container from "@mui/joy/Container";
import Stack from "@mui/joy/Stack";
import Typography from "@mui/joy/Typography";
import { ArrowLeft, ClipboardList, UserRoundCog } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import UserAdminEditor from "./UserAdminEditor";

export default async function AdminUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      wallet: { select: { balance: true } },
      _count: {
        select: {
          ordersAsCustomer: true,
          ordersAsFreelancer: true,
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  const completedOrdersCount = await prisma.order.count({
    where: {
      freelancerId: user.id,
      status: "COMPLETED",
    },
  });

  const orders = await prisma.order.findMany({
    where: {
      OR: [{ customerId: user.id }, { freelancerId: user.id }],
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      status: true,
      stack: true,
      budget: true,
      customerId: true,
      freelancerId: true,
      customer: { select: { email: true } },
      freelancer: { select: { email: true } },
    },
  });

  const createdOrdersCount = user._count.ordersAsCustomer;

  return (
    <Box sx={{ minHeight: "100dvh" }}>
      <Header />
      <Container
        maxWidth="lg"
        sx={{ py: { xs: 2, sm: 3 }, display: "flex", flexDirection: "column", gap: 2 }}
      >
        <Card variant="outlined" sx={{ borderRadius: "xl", p: 2 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            spacing={1.2}
          >
            <Stack spacing={0.5}>
              <Typography level="h1" startDecorator={<UserRoundCog size={18} />}>
                Пользователь
              </Typography>
              <Typography level="body-sm" sx={{ opacity: 0.8 }}>
                Сводка и управление профилем
              </Typography>
            </Stack>

            <Button
              component={Link}
              href="/admin"
              variant="outlined"
              startDecorator={<ArrowLeft size={16} />}
            >
              Назад в админку
            </Button>
          </Stack>
        </Card>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2 }}>
          <Card variant="outlined" sx={{ borderRadius: "xl", p: 2 }}>
            <Stack spacing={1.25}>
              <Typography level="title-lg">Профиль</Typography>
              <Typography level="title-md">
                {user.name ? `${user.name} (${user.email})` : user.email}
              </Typography>

              <Stack direction="row" spacing={0.8} flexWrap="wrap">
                <Chip size="sm" variant="soft" color="neutral">
                  {user.role}
                </Chip>
                <Chip size="sm" variant="soft" color="success">
                  Баланс: {user.wallet?.balance ?? 0} ₽
                </Chip>
                <Chip size="sm" variant="soft" color="primary">
                  Создано: {createdOrdersCount}
                </Chip>
                {user.role === "FREELANCER" ? (
                  <Chip size="sm" variant="soft" color="warning">
                    Выполнено: {completedOrdersCount}
                  </Chip>
                ) : null}
              </Stack>

              <Typography level="body-xs" sx={{ opacity: 0.75 }}>
                ID: {user.id}
              </Typography>

              <UserAdminEditor
                userId={user.id}
                initialName={user.name}
                initialRole={user.role}
              />
            </Stack>
          </Card>

          <Card variant="outlined" sx={{ borderRadius: "xl", p: 2 }}>
            <Stack spacing={1.25}>
              <Typography level="title-lg" startDecorator={<ClipboardList size={17} />}>
                Заказы пользователя
              </Typography>

              {orders.length === 0 ? (
                <Typography level="body-sm" sx={{ opacity: 0.8 }}>
                  У пользователя пока нет связанных заказов.
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {orders.map((order) => {
                    const relation =
                      order.customerId === user.id
                        ? "Создатель"
                        : order.freelancerId === user.id
                          ? "Исполнитель"
                          : "Участник";

                    return (
                      <Card
                        key={order.id}
                        variant="soft"
                        color="neutral"
                        sx={{ borderRadius: "lg", p: 1.2 }}
                      >
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
                            {relation}: {order.customer.email}
                            {order.freelancer?.email ? ` -> ${order.freelancer.email}` : " -> без исполнителя"}
                          </Typography>

                          <Button
                            component={Link}
                            href={`/orders/${order.id}`}
                            size="sm"
                            variant="outlined"
                            sx={{ width: "fit-content" }}
                          >
                            Открыть и изменить
                          </Button>
                        </Stack>
                      </Card>
                    );
                  })}
                </Stack>
              )}
            </Stack>
          </Card>
        </Box>
      </Container>
    </Box>
  );
}
