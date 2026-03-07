import Header from "@/widgets/header/ui/Header";
import { authOptions } from "@/lib/authOptions";
import { OrderStatus, Prisma } from "@/generated/prisma/client";
import { prisma } from "@db/prisma";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Card from "@mui/joy/Card";
import Chip from "@mui/joy/Chip";
import Container from "@mui/joy/Container";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import Option from "@mui/joy/Option";
import Select from "@mui/joy/Select";
import Stack from "@mui/joy/Stack";
import Typography from "@mui/joy/Typography";
import {
  BadgeDollarSign,
  Filter,
  Layers,
  Plus,
  Search,
  Trophy,
} from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

function statusChip(status: string) {
  if (status === "OPEN") {
    return (
      <Chip size="sm" color="primary" variant="soft">
        Открыт
      </Chip>
    );
  }
  if (status === "IN_PROGRESS") {
    return (
      <Chip size="sm" color="warning" variant="soft">
        В работе
      </Chip>
    );
  }
  if (status === "COMPLETED") {
    return (
      <Chip size="sm" color="success" variant="soft">
        Завершен
      </Chip>
    );
  }
  return (
    <Chip size="sm" color="neutral" variant="soft">
      {status}
    </Chip>
  );
}

function roleDescription(role: string) {
  if (role === "CUSTOMER") return "Вы видите только свои заказы";
  if (role === "FREELANCER") {
    return "Показываются доступные заказы и заказы в работе";
  }
  return "Режим администратора";
}

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{
    q?: string;
    status?: string;
    stack?: string;
    minBudget?: string;
    maxBudget?: string;
  }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const resolvedSearchParams = await searchParams;

  const q = resolvedSearchParams?.q ?? "";
  const stack = resolvedSearchParams?.stack ?? "";

  const statusParam = resolvedSearchParams?.status;
  const status =
    statusParam &&
    (Object.values(OrderStatus) as string[]).includes(statusParam)
      ? (statusParam as OrderStatus)
      : undefined;

  const minBudget = Number.isFinite(Number(resolvedSearchParams?.minBudget))
    ? Number(resolvedSearchParams?.minBudget)
    : undefined;
  const maxBudget = Number.isFinite(Number(resolvedSearchParams?.maxBudget))
    ? Number(resolvedSearchParams?.maxBudget)
    : undefined;

  const roleWhere: Prisma.OrderWhereInput | undefined =
    session.user.role === "ADMIN"
      ? undefined
      : session.user.role === "CUSTOMER"
        ? { customerId: session.user.id }
        : session.user.role === "FREELANCER"
          ? {
              OR: [
                { status: OrderStatus.OPEN, freelancerId: null },
                { freelancerId: session.user.id },
              ],
            }
          : undefined;

  const and: Prisma.OrderWhereInput[] = [];
  if (roleWhere) and.push(roleWhere);
  if (q) and.push({ title: { contains: q } });
  if (status) and.push({ status });
  if (stack) and.push({ stack: { contains: stack } });
  if (minBudget !== undefined) and.push({ budget: { gte: minBudget } });
  if (maxBudget !== undefined) and.push({ budget: { lte: maxBudget } });

  const where: Prisma.OrderWhereInput = and.length ? { AND: and } : {};

  const orders = await prisma.order.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      stack: true,
      budget: true,
      status: true,
      createdAt: true,
    },
  });

  const leaderboardRows = await prisma.order.groupBy({
    by: ["freelancerId"],
    where: {
      status: OrderStatus.COMPLETED,
      freelancerId: { not: null },
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 5,
  });

  const freelancerIds = leaderboardRows
    .map((r) => r.freelancerId)
    .filter((v): v is string => Boolean(v));

  const freelancers = freelancerIds.length
    ? await prisma.user.findMany({
        where: { id: { in: freelancerIds } },
        select: { id: true, name: true, email: true },
      })
    : [];

  const leaderboard = leaderboardRows.map((r) => {
    const user = freelancers.find((u) => u.id === r.freelancerId) ?? null;
    return { user, completed: r._count.id };
  });

  return (
    <Box sx={{ minHeight: "100dvh" }}>
      <Header />
      <Container
        maxWidth="lg"
        sx={{
          py: { xs: 2, sm: 3 },
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Card variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: "xl" }}>
          <Stack spacing={2}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", sm: "flex-end" }}
              spacing={2}
            >
              <Stack spacing={0.5}>
                <Typography
                  level="h1"
                  sx={{ fontSize: { xs: "1.7rem", sm: "2rem" } }}
                >
                  Биржа заказов
                </Typography>
                <Typography level="body-sm" sx={{ opacity: 0.8 }}>
                  {roleDescription(session.user.role)}
                </Typography>
              </Stack>

              {session.user.role === "CUSTOMER" ? (
                <Button
                  component={Link}
                  href="/orders/new"
                  color="primary"
                  variant="solid"
                  startDecorator={<Plus size={16} />}
                >
                  Создать заказ
                </Button>
              ) : null}
            </Stack>

            <Stack
              component="form"
              action="/"
              method="get"
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
            >
              <Input
                name="q"
                defaultValue={q}
                placeholder="Поиск по названию заказа..."
                startDecorator={<Search size={16} />}
                sx={{ flex: 1 }}
              />
              <Button type="submit" variant="solid">
                Найти
              </Button>
            </Stack>
          </Stack>
        </Card>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              xl: "280px minmax(0, 1fr) 280px",
            },
            gap: 2,
            alignItems: "start",
          }}
        >
          <Card variant="outlined" sx={{ borderRadius: "xl", p: 2, overflow: "hidden" }}>
            <Stack
              component="form"
              action="/"
              method="get"
              spacing={1.5}
              sx={{ width: "100%", minWidth: 0 }}
            >
              <Typography level="title-md" startDecorator={<Filter size={16} />}>
                Фильтры
              </Typography>

              <FormControl size="sm" sx={{ minWidth: 0 }}>
                <FormLabel>Поиск</FormLabel>
                <Input
                  name="q"
                  defaultValue={q}
                  placeholder="Название заказа"
                  startDecorator={<Search size={14} />}
                  sx={{ minWidth: 0 }}
                />
              </FormControl>

              <FormControl size="sm" sx={{ minWidth: 0 }}>
                <FormLabel>Статус</FormLabel>
                <Select name="status" defaultValue={statusParam ?? ""}>
                  <Option value="">Любой</Option>
                  <Option value={OrderStatus.OPEN}>OPEN</Option>
                  <Option value={OrderStatus.IN_PROGRESS}>IN_PROGRESS</Option>
                  <Option value={OrderStatus.COMPLETED}>COMPLETED</Option>
                </Select>
              </FormControl>

              <FormControl size="sm" sx={{ minWidth: 0 }}>
                <FormLabel>Стек содержит</FormLabel>
                <Input
                  name="stack"
                  defaultValue={stack}
                  placeholder="React"
                  startDecorator={<Layers size={14} />}
                  sx={{ minWidth: 0 }}
                />
              </FormControl>

              <Box
                sx={{
                  display: "grid",
                  gap: 1,
                  gridTemplateColumns: {
                    xs: "repeat(2, minmax(0, 1fr))",
                    xl: "1fr",
                  },
                }}
              >
                <FormControl size="sm" sx={{ minWidth: 0 }}>
                  <FormLabel>Бюджет от</FormLabel>
                  <Input
                    name="minBudget"
                    defaultValue={resolvedSearchParams?.minBudget ?? ""}
                    type="number"
                    placeholder="0"
                    sx={{ minWidth: 0 }}
                  />
                </FormControl>
                <FormControl size="sm" sx={{ minWidth: 0 }}>
                  <FormLabel>Бюджет до</FormLabel>
                  <Input
                    name="maxBudget"
                    defaultValue={resolvedSearchParams?.maxBudget ?? ""}
                    type="number"
                    placeholder="50000"
                    sx={{ minWidth: 0 }}
                  />
                </FormControl>
              </Box>

              <Stack
                direction={{ xs: "column", sm: "row", xl: "column" }}
                spacing={1}
              >
                <Button type="submit" variant="solid" sx={{ flex: 1 }}>
                  Применить
                </Button>
                <Button component={Link} href="/" variant="outlined" color="neutral">
                  Сброс
                </Button>
              </Stack>
            </Stack>
          </Card>

          <Stack spacing={1.5}>
            {orders.length === 0 ? (
              <Card variant="soft" color="neutral" sx={{ borderRadius: "xl", p: 2.5 }}>
                <Typography level="body-sm" sx={{ opacity: 0.8 }}>
                  По текущим фильтрам заказов не найдено.
                </Typography>
              </Card>
            ) : null}

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
                gap: 1.5,
              }}
            >
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <Card
                    variant="outlined"
                    sx={{
                      borderRadius: "xl",
                      p: 2,
                      height: "100%",
                      transition: "0.2s ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "sm",
                        borderColor: "primary.outlinedBorder",
                      },
                    }}
                  >
                    <Stack spacing={1.5}>
                      <Stack direction="row" justifyContent="space-between" spacing={1}>
                        <Typography level="title-md">{order.title}</Typography>
                        {statusChip(order.status)}
                      </Stack>
                      <Typography
                        level="body-sm"
                        sx={{
                          opacity: 0.85,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        Стек: {order.stack}
                      </Typography>
                      <Typography
                        level="title-sm"
                        startDecorator={<BadgeDollarSign size={16} />}
                        sx={{ mt: "auto" }}
                      >
                        {order.budget} ₽
                      </Typography>
                    </Stack>
                  </Card>
                </Link>
              ))}
            </Box>
          </Stack>

          <Card variant="outlined" sx={{ borderRadius: "xl", p: 2 }}>
            <Stack spacing={1.25}>
              <Typography level="title-md" startDecorator={<Trophy size={16} />}>
                Лидеры
              </Typography>
              <Typography level="body-sm" sx={{ opacity: 0.78 }}>
                Топ исполнителей по завершенным заказам
              </Typography>

              {leaderboard.length === 0 ? (
                <Typography level="body-sm" sx={{ opacity: 0.7 }}>
                  Пока данных нет
                </Typography>
              ) : (
                <List size="sm" sx={{ "--List-gap": "8px" }}>
                  {leaderboard.map((row, idx) => (
                    <ListItem key={row.user?.id ?? idx}>
                      <Card
                        variant="soft"
                        color="neutral"
                        sx={{
                          width: "100%",
                          borderRadius: "lg",
                          p: 1.25,
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" spacing={1}>
                          <Stack>
                            <Typography level="title-sm">
                              #{idx + 1} {row.user?.name ?? row.user?.email ?? "Unknown"}
                            </Typography>
                            {row.user?.email ? (
                              <Typography level="body-xs" sx={{ opacity: 0.7 }}>
                                {row.user.email}
                              </Typography>
                            ) : null}
                          </Stack>
                          <Chip size="sm" color="success" variant="soft">
                            {row.completed}
                          </Chip>
                        </Stack>
                      </Card>
                    </ListItem>
                  ))}
                </List>
              )}
            </Stack>
          </Card>
        </Box>
      </Container>
    </Box>
  );
}
