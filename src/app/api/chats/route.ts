import { prisma } from "@db/prisma";
import { requireSession } from "@/lib/apiAuth";

export async function GET(req: Request) {
  const { session, response } = await requireSession();
  if (!session) return response;

  const url = new URL(req.url);
  const orderId = url.searchParams.get("orderId");

  if (orderId) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, customerId: true, freelancerId: true },
    });

    if (!order) {
      return Response.json(
        { ok: false, message: "Order not found" },
        { status: 404 },
      );
    }

    const isParticipant =
      order.customerId === session.user.id ||
      order.freelancerId === session.user.id;

    if (!isParticipant) {
      return Response.json(
        { ok: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    if (!order.freelancerId) {
      return Response.json(
        { ok: false, message: "Freelancer is not selected yet" },
        { status: 409 },
      );
    }

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

  const chats = await prisma.chat.findMany({
    where: {
      OR: [{ customerId: session.user.id }, { freelancerId: session.user.id }],
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      order: { select: { id: true, title: true } },
      customer: { select: { id: true, email: true, name: true } },
      freelancer: { select: { id: true, email: true, name: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { text: true, createdAt: true },
      },
    },
  });

  return Response.json({ ok: true, data: chats, message: "Success" });
}
