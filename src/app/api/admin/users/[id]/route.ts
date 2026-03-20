import { prisma } from "@db/prisma";
import { Roles } from "@/generated/prisma/client";
import { requireRole } from "@/lib/apiAuth";

const availableRoles = new Set(Object.values(Roles));

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { session, response } = await requireRole(["ADMIN"]);
  if (!session) return response;

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!user) {
    return Response.json({ ok: false, message: "User not found" }, { status: 404 });
  }

  const body = await req.json();
  const data: { name?: string | null; role?: Roles } = {};

  if ("name" in body) {
    if (body.name === null) {
      data.name = null;
    } else if (typeof body.name === "string") {
      const normalized = body.name.trim();
      data.name = normalized || null;
    } else {
      return Response.json(
        { ok: false, message: "Invalid name" },
        { status: 400 },
      );
    }
  }

  if ("role" in body) {
    if (typeof body.role !== "string" || !availableRoles.has(body.role as Roles)) {
      return Response.json(
        { ok: false, message: "Invalid role" },
        { status: 400 },
      );
    }

    data.role = body.role as Roles;
  }

  if (Object.keys(data).length === 0) {
    return Response.json(
      { ok: false, message: "Nothing to update" },
      { status: 400 },
    );
  }

  const updated = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      wallet: { select: { balance: true } },
    },
  });

  return Response.json({ ok: true, data: updated, message: "Updated" });
}
