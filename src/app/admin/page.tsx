import Header from "@/widgets/header/ui/Header";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@db/prisma";

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
    <div className="min-h-screen">
      <Header />
      <main className="max-w-6xl mx-auto p-4 flex flex-col gap-6">
        <h1 className="text-2xl font-semibold">Админ панель</h1>

        <section className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-3">Пользователи</h2>
          <div className="grid gap-2">
            {users.map((u) => (
              <div key={u.id} className="flex justify-between text-sm">
                <div>
                  {u.email} {u.name ? `(${u.name})` : ""}
                </div>
                <div className="opacity-80">
                  {u.role} · {u.wallet?.balance ?? 0} ₽
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-3">Заказы</h2>
          <div className="grid gap-2">
            {orders.map((o) => (
              <div key={o.id} className="flex justify-between text-sm">
                <div>
                  {o.title} · {o.stack} · {o.budget} ₽
                </div>
                <div className="opacity-80">
                  {o.status} · {o.customer.email}
                  {o.freelancer?.email ? ` -> ${o.freelancer.email}` : ""}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
