import Header from "@/widgets/header/ui/Header";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@db/prisma";
import Link from "next/link";

export default async function ChatsPage({
  searchParams,
}: {
  searchParams?: { orderId?: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const orderId = searchParams?.orderId;

  if (orderId) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, customerId: true, freelancerId: true },
    });

    if (order) {
      const isParticipant =
        order.customerId === session.user.id ||
        order.freelancerId === session.user.id;

      if (isParticipant && order.freelancerId) {
        await prisma.chat.upsert({
          where: {
            orderId_customerId_freelancerId: {
              orderId: order.id,
              customerId: order.customerId,
              freelancerId: order.freelancerId,
            },
          },
          update: {},
          create: {
            orderId: order.id,
            customerId: order.customerId,
            freelancerId: order.freelancerId,
          },
        });
      }
    }
  }

  const chats = await prisma.chat.findMany({
    where: {
      OR: [{ customerId: session.user.id }, { freelancerId: session.user.id }],
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      order: { select: { id: true, title: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { text: true, createdAt: true },
      },
    },
  });

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-4xl mx-auto p-4 flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Чаты</h1>

        <div className="grid gap-3">
          {chats.map((c) => (
            <Link
              key={c.id}
              href={`/chats/${c.id}`}
              className="border rounded-lg p-4 hover:bg-black/5"
            >
              <div className="font-semibold">{c.order.title}</div>
              <div className="text-sm opacity-70">
                {c.messages[0]?.text ?? "Сообщений пока нет"}
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
