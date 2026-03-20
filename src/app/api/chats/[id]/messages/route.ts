import { prisma } from "@db/prisma";
import { requireSession } from "@/lib/apiAuth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { session, response } = await requireSession();
  if (!session) return response;

  const { id } = await params;
  const body = await req.json();
  const text = String(body?.text ?? "").trim();

  if (!text) {
    return Response.json(
      { ok: false, message: "Empty message" },
      { status: 400 },
    );
  }

  const chat = await prisma.chat.findUnique({
    where: { id },
    select: { id: true, customerId: true, freelancerId: true },
  });

  if (!chat) {
    return Response.json(
      { ok: false, message: "Chat not found" },
      { status: 404 },
    );
  }

  const isParticipant =
    chat.customerId === session.user.id ||
    chat.freelancerId === session.user.id;

  if (!isParticipant) {
    return Response.json({ ok: false, message: "Forbidden" }, { status: 403 });
  }

  const message = await prisma.message.create({
    data: {
      chatId: chat.id,
      senderId: session.user.id,
      text,
    },
    select: {
      id: true,
      text: true,
      createdAt: true,
      senderId: true,
      sender: { select: { id: true, email: true, name: true } },
    },
  });

  return Response.json(
    { ok: true, data: message, message: "Sent" },
    { status: 201 },
  );
}
