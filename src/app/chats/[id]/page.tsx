import Header from "@/widgets/header/ui/Header";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@db/prisma";
import Link from "next/link";
import ChatRoom from "./ChatRoom";

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

        <ChatRoom
          chatId={chat.id}
          currentUserId={session.user.id}
          initialMessages={chat.messages}
        />
      </main>
    </div>
  );
}
