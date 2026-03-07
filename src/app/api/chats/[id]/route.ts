import { prisma } from "@db/prisma";
import { requireSession } from "@/lib/apiAuth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { session, response } = await requireSession();
  if (!session) return response;

  const { id } = await params;

  const chat = await prisma.chat.findUnique({
    where: { id },
    select: {
      id: true,
      createdAt: true,
      orderId: true,
      customerId: true,
      freelancerId: true,
      order: { select: { id: true, title: true } },
      customer: { select: { id: true, email: true, name: true } },
      freelancer: { select: { id: true, email: true, name: true } },
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

  if (!chat) {
    return Response.json({ ok: false, message: "Not found" }, { status: 404 });
  }

  const isParticipant =
    chat.customerId === session.user.id ||
    chat.freelancerId === session.user.id;

  if (!isParticipant) {
    return Response.json({ ok: false, message: "Forbidden" }, { status: 403 });
  }

  return Response.json({ ok: true, data: chat, message: "Success" });
}
