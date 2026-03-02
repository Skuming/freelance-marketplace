import Header from "@/widgets/header/ui/Header";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@db/prisma";
import Link from "next/link";
import { OrderStatus, Prisma } from "@/generated/prisma/client";

function statusBadge(status: string) {
  const base = "text-xs px-2 py-1 rounded-full border";
  if (status === "OPEN") {
    return (
      <span
        className={`${base} bg-[rgba(20,168,0,0.10)] border-[rgba(20,168,0,0.35)] text-[#0e7a00]`}
      >
        Открыт
      </span>
    );
  }
  if (status === "IN_PROGRESS") {
    return (
      <span
        className={`${base} bg-[rgba(45,212,191,0.12)] border-[rgba(45,212,191,0.35)] text-[rgb(15,118,110)]`}
      >
        В работе
      </span>
    );
  }
  if (status === "COMPLETED") {
    return (
      <span
        className={`${base} bg-[rgba(34,197,94,0.12)] border-[rgba(34,197,94,0.35)] text-[rgb(21,128,61)]`}
      >
        Завершён
      </span>
    );
  }
  return <span className={`${base} opacity-70`}>{status}</span>;
}

export default async function Home({
  searchParams,
}: {
  searchParams?: {
    q?: string;
    status?: string;
    stack?: string;
    minBudget?: string;
    maxBudget?: string;
  };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const q = searchParams?.q ?? "";
  const stack = searchParams?.stack ?? "";

  const statusParam = searchParams?.status;
  const status =
    statusParam &&
    (Object.values(OrderStatus) as string[]).includes(statusParam)
      ? (statusParam as OrderStatus)
      : undefined;

  const minBudget = Number.isFinite(Number(searchParams?.minBudget))
    ? Number(searchParams?.minBudget)
    : undefined;
  const maxBudget = Number.isFinite(Number(searchParams?.maxBudget))
    ? Number(searchParams?.maxBudget)
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

  const surfaceStyle = {
    backgroundColor:
      "rgba(var(--joy-palette-background-surfaceChannel) / 0.72)",
    borderColor:
      "rgba(var(--joy-palette-neutral-outlinedBorderChannel) / 0.35)",
  } as const;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-6xl mx-auto p-4 sm:p-6 flex flex-col gap-5">
        <div
          className="rounded-2xl p-5 sm:p-6 border backdrop-blur-md shadow-xs"
          style={surfaceStyle}
        >
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold">
                  Биржа заказов
                </h1>
                <div className="text-sm opacity-80">
                  {session.user.role === "CUSTOMER"
                    ? "Вы видите только свои заказы"
                    : session.user.role === "FREELANCER"
                      ? "Вы видите доступные заказы и те, что вы взяли"
                      : "Админ режим"}
                </div>
              </div>

              {session.user.role === "CUSTOMER" ? (
                <Link
                  className="rounded-xl px-4 py-2 text-white bg-[#14a800] hover:bg-[#0e7a00] text-center"
                  href="/orders/new"
                >
                  Создать заказ
                </Link>
              ) : null}
            </div>

            <form
              action="/"
              method="get"
              className="flex flex-col sm:flex-row gap-2"
            >
              <input
                name="q"
                defaultValue={q}
                placeholder="Поиск по названию заказа..."
                className="w-full border rounded-xl px-4 py-3"
                style={{
                  backgroundColor:
                    "rgba(var(--joy-palette-background-surfaceChannel) / 0.55)",
                  borderColor:
                    "rgba(var(--joy-palette-neutral-outlinedBorderChannel) / 0.35)",
                }}
              />
              <button className="rounded-xl px-4 py-3 border hover:bg-black/5">
                Найти
              </button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_280px] gap-4 items-start">
          <aside
            className="rounded-2xl border backdrop-blur-md shadow-xs p-4 flex flex-col gap-3"
            style={surfaceStyle}
          >
            <div className="font-semibold">Фильтры</div>
            <form action="/" method="get" className="flex flex-col gap-2">
              <input type="hidden" name="q" defaultValue={q} />
              <div className="text-sm opacity-80">Статус</div>
              <select
                name="status"
                defaultValue={statusParam ?? ""}
                className="w-full border rounded-xl px-3 py-2"
                style={surfaceStyle}
              >
                <option value="">Любой</option>
                <option value={OrderStatus.OPEN}>OPEN</option>
                <option value={OrderStatus.IN_PROGRESS}>IN_PROGRESS</option>
                <option value={OrderStatus.COMPLETED}>COMPLETED</option>
              </select>

              <div className="text-sm opacity-80">Стек содержит</div>
              <input
                name="stack"
                defaultValue={stack}
                placeholder="React"
                className="w-full border rounded-xl px-3 py-2"
                style={surfaceStyle}
              />

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <div className="text-sm opacity-80">Бюджет от</div>
                  <input
                    name="minBudget"
                    defaultValue={searchParams?.minBudget ?? ""}
                    type="number"
                    placeholder="0"
                    className="w-full border rounded-xl px-3 py-2"
                    style={surfaceStyle}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="text-sm opacity-80">Бюджет до</div>
                  <input
                    name="maxBudget"
                    defaultValue={searchParams?.maxBudget ?? ""}
                    type="number"
                    placeholder="50000"
                    className="w-full border rounded-xl px-3 py-2"
                    style={surfaceStyle}
                  />
                </div>
              </div>

              <button className="rounded-xl px-4 py-2 border hover:bg-black/5">
                Применить
              </button>

              <Link className="text-sm opacity-80 hover:opacity-100" href="/">
                Сбросить
              </Link>
            </form>
          </aside>

          <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
              {orders.map((o) => (
                <Link
                  key={o.id}
                  href={`/orders/${o.id}`}
                  className="rounded-2xl border backdrop-blur-md shadow-xs p-5 hover:translate-y-[-1px] hover:shadow-md transition"
                  style={surfaceStyle}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <div className="font-semibold text-lg leading-snug">
                        {o.title}
                      </div>
                      <div className="text-sm opacity-80 line-clamp-2">
                        Стек: {o.stack}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {statusBadge(o.status)}
                      <div className="font-semibold">{o.budget} ₽</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {orders.length === 0 ? (
              <div className="text-center opacity-80 py-8">
                Нет заказов по текущим фильтрам
              </div>
            ) : null}
          </section>

          <aside
            className="rounded-2xl border backdrop-blur-md shadow-xs p-4 flex flex-col gap-3"
            style={surfaceStyle}
          >
            <div className="font-semibold">Лидерборд</div>
            <div className="text-sm opacity-80">Топ по выполненным заказам</div>
            <div className="flex flex-col gap-2">
              {leaderboard.map((row, idx) => (
                <div
                  key={row.user?.id ?? idx}
                  className="flex items-center justify-between gap-2 rounded-xl border px-3 py-2"
                  style={{
                    backgroundColor:
                      "rgba(var(--joy-palette-background-surfaceChannel) / 0.55)",
                    borderColor:
                      "rgba(var(--joy-palette-neutral-outlinedBorderChannel) / 0.28)",
                  }}
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">
                      #{idx + 1}{" "}
                      {row.user?.name ?? row.user?.email ?? "Unknown"}
                    </div>
                    {row.user?.email ? (
                      <div className="text-xs opacity-70 truncate">
                        {row.user.email}
                      </div>
                    ) : null}
                  </div>
                  <div className="text-sm font-semibold">{row.completed}</div>
                </div>
              ))}
              {leaderboard.length === 0 ? (
                <div className="text-sm opacity-70">Пока нет данных</div>
              ) : null}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
