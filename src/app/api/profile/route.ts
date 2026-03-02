import { prisma } from "@db/prisma";
import { requireSession } from "@/lib/apiAuth";

export async function GET() {
  const { session, response } = await requireSession();
  if (!session) return response;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      wallet: { select: { balance: true } },
    },
  });

  if (!user) {
    return Response.json({ ok: false, message: "Not found" }, { status: 404 });
  }

  return Response.json({ ok: true, data: user, message: "Success" });
}

export async function PATCH(req: Request) {
  const { session, response } = await requireSession();
  if (!session) return response;

  const body = await req.json();
  const name = body?.name === null ? null : String(body?.name ?? "").trim();

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: name === "" ? null : name,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  return Response.json({ ok: true, data: updated, message: "Updated" });
}
