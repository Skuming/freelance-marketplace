import { prisma } from "@db/prisma";
import { requireRole } from "@/lib/apiAuth";

export async function GET() {
  const { session, response } = await requireRole(["ADMIN"]);
  if (!session) return response;

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      budget: true,
      stack: true,
      status: true,
      createdAt: true,
      customer: { select: { id: true, email: true } },
      freelancer: { select: { id: true, email: true } },
    },
  });

  return Response.json({ ok: true, data: orders, message: "Success" });
}
