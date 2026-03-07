import { prisma } from "@db/prisma";
import { requireRole, requireSession } from "@/lib/apiAuth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { session, response } = await requireSession();
  if (!session) return response;

  const { id } = await params;

  const raw = await prisma.order.findUnique({
    where: { id },
    select: {
      id: true,
      customerId: true,
      freelancerId: true,
      status: true,
    },
  });

  if (!raw) {
    return Response.json({ ok: false, message: "Not found" }, { status: 404 });
  }

  const canSee =
    session.user.role === "ADMIN" ||
    raw.customerId === session.user.id ||
    raw.freelancerId === session.user.id ||
    (session.user.role === "FREELANCER" &&
      raw.status === "OPEN" &&
      raw.freelancerId === null);

  if (!canSee) {
    return Response.json({ ok: false, message: "Not found" }, { status: 404 });
  }

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
      customer: {
        select: { id: true, name: true, email: true },
      },
      freelancer: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!order) {
    return Response.json({ ok: false, message: "Not found" }, { status: 404 });
  }

  return Response.json({ ok: true, data: order, message: "Success" });
}

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { session, response } = await requireRole(["FREELANCER"]);
  if (!session) return response;

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    select: { id: true, status: true, freelancerId: true },
  });

  if (!order) {
    return Response.json({ ok: false, message: "Not found" }, { status: 404 });
  }

  if (order.status !== "OPEN" || order.freelancerId) {
    return Response.json(
      { ok: false, message: "Order is not available" },
      { status: 409 },
    );
  }

  const updated = await prisma.order.update({
    where: { id },
    data: {
      freelancerId: session.user.id,
      status: "IN_PROGRESS",
    },
    select: {
      id: true,
      status: true,
      freelancerId: true,
    },
  });

  return Response.json({ ok: true, data: updated, message: "Taken" });
}
