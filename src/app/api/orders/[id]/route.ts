import { prisma } from "@db/prisma";
import { requireSession } from "@/lib/apiAuth";
import { OrderStatus, Prisma, Roles } from "@/generated/prisma/client";

const availableStatuses = new Set(Object.values(OrderStatus));

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
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { session, response } = await requireSession();
  if (!session) return response;

  const { id } = await params;

  const existingOrder = await prisma.order.findUnique({
    where: { id },
    select: { id: true, status: true, freelancerId: true },
  });

  if (!existingOrder) {
    return Response.json({ ok: false, message: "Not found" }, { status: 404 });
  }

  if (session.user.role === "ADMIN") {
    const body = await req.json();
    const data: Prisma.OrderUncheckedUpdateInput = {};

    if ("title" in body) {
      if (typeof body.title !== "string" || !body.title.trim()) {
        return Response.json(
          { ok: false, message: "Invalid title" },
          { status: 400 },
        );
      }
      data.title = body.title.trim();
    }

    if ("description" in body) {
      if (typeof body.description !== "string" || !body.description.trim()) {
        return Response.json(
          { ok: false, message: "Invalid description" },
          { status: 400 },
        );
      }
      data.description = body.description.trim();
    }

    if ("stack" in body) {
      if (typeof body.stack !== "string" || !body.stack.trim()) {
        return Response.json(
          { ok: false, message: "Invalid stack" },
          { status: 400 },
        );
      }
      data.stack = body.stack.trim();
    }

    if ("budget" in body) {
      const parsedBudget = Number.parseInt(String(body.budget), 10);
      if (!Number.isFinite(parsedBudget) || parsedBudget <= 0) {
        return Response.json(
          { ok: false, message: "Invalid budget" },
          { status: 400 },
        );
      }
      data.budget = parsedBudget;
    }

    if ("status" in body) {
      if (
        typeof body.status !== "string" ||
        !availableStatuses.has(body.status as OrderStatus)
      ) {
        return Response.json(
          { ok: false, message: "Invalid status" },
          { status: 400 },
        );
      }
      data.status = body.status as OrderStatus;
    }

    if ("freelancerId" in body) {
      if (body.freelancerId === null || body.freelancerId === "") {
        data.freelancerId = null;
      } else if (typeof body.freelancerId === "string") {
        const candidate = await prisma.user.findUnique({
          where: { id: body.freelancerId },
          select: { id: true, role: true },
        });

        if (!candidate || candidate.role !== Roles.FREELANCER) {
          return Response.json(
            { ok: false, message: "Freelancer not found" },
            { status: 400 },
          );
        }

        data.freelancerId = candidate.id;
      } else {
        return Response.json(
          { ok: false, message: "Invalid freelancerId" },
          { status: 400 },
        );
      }
    }

    if (Object.keys(data).length === 0) {
      return Response.json(
        { ok: false, message: "Nothing to update" },
        { status: 400 },
      );
    }

    const updated = await prisma.order.update({
      where: { id },
      data,
      select: {
        id: true,
        title: true,
        description: true,
        stack: true,
        budget: true,
        status: true,
        customerId: true,
        freelancerId: true,
      },
    });

    return Response.json({ ok: true, data: updated, message: "Updated" });
  }

  if (session.user.role !== "FREELANCER") {
    return Response.json({ ok: false, message: "Forbidden" }, { status: 403 });
  }

  if (existingOrder.status !== "OPEN" || existingOrder.freelancerId) {
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
