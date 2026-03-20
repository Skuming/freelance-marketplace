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
import { BadgeDollarSign, MessageSquareText, UserRound } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import AdminOrderEditor from "./AdminOrderEditor";
import TakeOrderButton from "./TakeOrderButton";

function statusChip(status: string) {
  if (status === "OPEN") {
    return <Chip size="sm" color="primary" variant="soft">Открыт</Chip>;
  }
  if (status === "IN_PROGRESS") {
    return <Chip size="sm" color="warning" variant="soft">В работе</Chip>;
  }
  if (status === "COMPLETED") {
    return <Chip size="sm" color="success" variant="soft">Завершен</Chip>;
  }
  return (
    <Chip size="sm" color="neutral" variant="soft">
      {status}
    </Chip>
  );
}

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      stack: true,
      budget: true,
      status: true,
      createdAt: true,
      customerId: true,
      freelancerId: true,
      customer: { select: { id: true, name: true, email: true } },
      freelancer: { select: { id: true, name: true, email: true } },
    },
  });

  if (!order) notFound();

  const canSee =
    session.user.role === "ADMIN" ||
    order.customerId === session.user.id ||
    order.freelancerId === session.user.id ||
    (session.user.role === "FREELANCER" &&
      order.status === "OPEN" &&
      order.freelancerId === null);

  if (!canSee) notFound();

  const freelancers =
    session.user.role === "ADMIN"
      ? await prisma.user.findMany({
          where: { role: "FREELANCER" },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            email: true,
            name: true,
          },
        })
      : [];

  return (
    <Box sx={{ minHeight: "100dvh" }}>
      <Header />
      <Container
        maxWidth="lg"
        sx={{ py: { xs: 2, sm: 3 }, display: "flex", flexDirection: "column", gap: 2 }}
      >
        <Card variant="outlined" sx={{ borderRadius: "xl", p: 2.5 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            spacing={2}
          >
            <Stack spacing={1.1}>
              <Stack direction="row" spacing={0.8} alignItems="center" flexWrap="wrap">
                {statusChip(order.status)}
                <Chip size="sm" variant="soft" color="neutral">
                  ID: {order.id.slice(0, 8)}
                </Chip>
              </Stack>
              <Typography level="h1" sx={{ fontSize: { xs: "1.65rem", sm: "1.95rem" } }}>
                {order.title}
              </Typography>
              <Typography level="body-sm" sx={{ opacity: 0.82 }}>
                Стек: {order.stack}
              </Typography>
            </Stack>

            <Card variant="soft" color="neutral" sx={{ borderRadius: "xl", p: 2, minWidth: 210 }}>
              <Stack spacing={0.7}>
                <Typography
                  level="body-sm"
                  startDecorator={<BadgeDollarSign size={16} />}
                >
                  Бюджет
                </Typography>
                <Typography level="h2" sx={{ fontSize: "1.8rem" }}>
                  {order.budget} ₽
                </Typography>
                {session.user.role === "FREELANCER" && order.status === "OPEN" ? (
                  <TakeOrderButton orderId={order.id} />
                ) : null}
              </Stack>
            </Card>
          </Stack>
        </Card>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1.6fr) minmax(280px, 1fr)" },
            gap: 2,
            alignItems: "start",
          }}
        >
          <Card variant="outlined" sx={{ borderRadius: "xl", p: 2 }}>
            <Typography level="title-md" sx={{ mb: 1 }}>
              Описание задачи
            </Typography>
            <Typography level="body-md" sx={{ whiteSpace: "pre-wrap", opacity: 0.9 }}>
              {order.description}
            </Typography>
          </Card>

          <Stack spacing={2}>
            <Card variant="outlined" sx={{ borderRadius: "xl", p: 2 }}>
              <Stack spacing={1.1}>
                <Typography level="title-md">Участники</Typography>

                <Card variant="soft" color="neutral" sx={{ borderRadius: "lg", p: 1.2 }}>
                  <Typography
                    level="body-sm"
                    startDecorator={<UserRound size={14} />}
                    sx={{ opacity: 0.8 }}
                  >
                    Заказчик
                  </Typography>
                  <Typography level="title-sm">{order.customer.email}</Typography>
                </Card>

                <Card variant="soft" color="neutral" sx={{ borderRadius: "lg", p: 1.2 }}>
                  <Typography
                    level="body-sm"
                    startDecorator={<UserRound size={14} />}
                    sx={{ opacity: 0.8 }}
                  >
                    Исполнитель
                  </Typography>
                  <Typography level="title-sm">
                    {order.freelancer ? order.freelancer.email : "Не выбран"}
                  </Typography>
                </Card>

                {order.freelancerId ? (
                  <Button
                    component={Link}
                    href={`/chats?orderId=${order.id}`}
                    variant="solid"
                    startDecorator={<MessageSquareText size={16} />}
                  >
                    Открыть чат
                  </Button>
                ) : (
                  <Typography level="body-sm" sx={{ opacity: 0.7 }}>
                    Чат станет доступен после назначения исполнителя.
                  </Typography>
                )}
              </Stack>
            </Card>

            {session.user.role === "ADMIN" ? (
              <AdminOrderEditor
                orderId={order.id}
                initialTitle={order.title}
                initialDescription={order.description}
                initialStack={order.stack}
                initialBudget={order.budget}
                initialStatus={order.status}
                initialFreelancerId={order.freelancerId}
                freelancers={freelancers}
              />
            ) : null}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
