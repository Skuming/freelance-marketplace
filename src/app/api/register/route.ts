import { prisma } from "@db/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  return Response.json(
    { ok: false, message: "Method not allowed" },
    { status: 405 },
  );
}

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const { password, email, role } = data.data;
    if (!password || !email || !role)
      return Response.json({ ok: false }, { status: 400 });

    const existing = await prisma.user.findUnique({ where: { email: email } });
    if (existing) {
      return Response.json(
        { ok: false, message: "User already exists!" },
        { status: 403 },
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        password: hashedPassword,
        email,
        role,
        wallet: {
          create: {},
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return Response.json(
      { ok: true, data: user, message: "Success!" },
      { status: 200 },
    );
  } catch {
    return Response.json(
      { ok: false, message: "Eternal error!" },
      { status: 500 },
    );
  }
}
