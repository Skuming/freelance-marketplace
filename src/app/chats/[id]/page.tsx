import Header from "@/widgets/header/ui/Header";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@db/prisma";
import MessageComposer from "./MessageComposer";
import Link from "next/link";

export default async function ChatPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const { id } = params;

  const chat = await prisma.chat.findUnique({
    where: { id },
    select: {
      id: true,
      order: { select: { id: true, title: true } },
      customerId: true,
      freelancerId: true,
      messages: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          text: true,
          createdAt: true,
          senderId: true,
          sender: { select: { id: true, email: true, name: true } },
        },
      },
    },
  });

  if (!chat) notFound();

  const isParticipant =
    chat.customerId === session.user.id ||
    chat.freelancerId === session.user.id;

  if (!isParticipant) {
    redirect("/");
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-4xl mx-auto p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Чат</h1>
          <Link className="underline" href={`/orders/${chat.order.id}`}>
            {chat.order.title}
          </Link>
        </div>

        <div className="border rounded-lg p-4 flex flex-col gap-2">
          {chat.messages.map((m) => (
            <div
              key={m.id}
              className={
                m.senderId === session.user.id ? "text-right" : "text-left"
              }
            >
              <div className="inline-block border rounded-md px-3 py-2 max-w-[80%]">
                <div className="text-sm opacity-70">
                  {m.sender.name ?? m.sender.email}
                </div>
                <div>{m.text}</div>
              </div>
            </div>
          ))}
        </div>

        <MessageComposer chatId={chat.id} />
      </main>
    </div>
  );
}
