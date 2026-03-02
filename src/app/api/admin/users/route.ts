import { prisma } from "@db/prisma";
import { requireRole } from "@/lib/apiAuth";

export async function GET() {
  const { session, response } = await requireRole(["ADMIN"]);
  if (!session) return response;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      wallet: { select: { balance: true } },
    },
  });

  return Response.json({ ok: true, data: users, message: "Success" });
}
