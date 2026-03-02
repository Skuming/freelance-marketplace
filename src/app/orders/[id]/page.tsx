import Header from "@/widgets/header/ui/Header";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@db/prisma";
import TakeOrderButton from "./TakeOrderButton";
import Link from "next/link";

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

export default async function OrderPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const { id } = params;

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

  const surfaceStyle = {
    backgroundColor:
      "rgba(var(--joy-palette-background-surfaceChannel) / 0.72)",
    borderColor:
      "rgba(var(--joy-palette-neutral-outlinedBorderChannel) / 0.35)",
  } as const;

  const surfaceStyleSoft = {
    backgroundColor:
      "rgba(var(--joy-palette-background-surfaceChannel) / 0.55)",
    borderColor:
      "rgba(var(--joy-palette-neutral-outlinedBorderChannel) / 0.28)",
  } as const;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-5xl mx-auto p-4 sm:p-6 flex flex-col gap-5">
        <div
          className="rounded-2xl border backdrop-blur-md shadow-xs p-5 sm:p-6"
          style={surfaceStyle}
        >
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {statusBadge(order.status)}
                  <span className="text-xs opacity-70">
                    ID: {order.id.slice(0, 8)}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-semibold leading-tight">
                  {order.title}
                </h1>
                <div className="text-sm opacity-80">Стек: {order.stack}</div>
              </div>

              <div
                className="rounded-2xl border p-4 sm:p-5"
                style={surfaceStyleSoft}
              >
                <div className="text-xs opacity-70">Бюджет</div>
                <div className="text-2xl font-semibold">{order.budget} ₽</div>
                {session.user.role === "FREELANCER" &&
                order.status === "OPEN" ? (
                  <div className="mt-3">
                    <TakeOrderButton orderId={order.id} />
                  </div>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div
                className="lg:col-span-2 rounded-2xl border p-4 sm:p-5 whitespace-pre-wrap"
                style={surfaceStyleSoft}
              >
                {order.description}
              </div>

              <div
                className="rounded-2xl border p-4 sm:p-5 flex flex-col gap-2"
                style={surfaceStyleSoft}
              >
                <div className="font-semibold">Участники</div>
                <div className="text-sm opacity-80">
                  Заказчик: {order.customer.email}
                </div>
                <div className="text-sm opacity-80">
                  Исполнитель:{" "}
                  {order.freelancer ? order.freelancer.email : "не выбран"}
                </div>

                {order.freelancerId ? (
                  <Link
                    href={`/chats?orderId=${order.id}`}
                    className="mt-2 rounded-xl px-4 py-2 text-white bg-[#14a800] hover:bg-[#0e7a00] text-center"
                  >
                    Открыть чат
                  </Link>
                ) : (
                  <div className="mt-2 text-sm opacity-70">
                    Чат появится после того как фрилансер возьмёт заказ
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
