import { prisma } from "@db/prisma";
import { requireRole, requireSession } from "@/lib/apiAuth";
import { OrderStatus, Prisma } from "@/generated/prisma/client";

export async function GET(req: Request) {
  const { session, response } = await requireSession();
  if (!session) return response;

  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";

  const roleWhere: Prisma.OrderWhereInput | undefined =
    session.user.role === "ADMIN"
      ? undefined
      : session.user.role === "CUSTOMER"
        ? { customerId: session.user.id }
        : session.user.role === "FREELANCER"
          ? {
              OR: [
                { status: OrderStatus.OPEN, freelancerId: null },
                { freelancerId: session.user.id },
              ],
            }
          : undefined;

  const and: Prisma.OrderWhereInput[] = [];
  if (roleWhere) and.push(roleWhere);
  if (q) and.push({ title: { contains: q } });

  const where: Prisma.OrderWhereInput = and.length ? { AND: and } : {};

  const orders = await prisma.order.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      stack: true,
      budget: true,
      status: true,
      createdAt: true,
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      freelancer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return Response.json({ ok: true, data: orders, message: "Success" });
}

export async function POST(req: Request) {
  const { session, response } = await requireRole(["CUSTOMER"]);
  if (!session) return response;

  const body = await req.json();
  const { title, description, stack, budget } = body;

  if (!title || !description || !stack || !budget) {
    return Response.json(
      { ok: false, message: "Invalid payload" },
      { status: 400 },
    );
  }

  const order = await prisma.order.create({
    data: {
      title,
      description,
      stack,
      budget: Number(budget),
      customerId: session.user.id,
    },
    select: {
      id: true,
      title: true,
      stack: true,
      budget: true,
      status: true,
      createdAt: true,
    },
  });

  return Response.json(
    { ok: true, data: order, message: "Created" },
    { status: 201 },
  );
}
