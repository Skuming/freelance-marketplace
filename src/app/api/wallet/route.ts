import { prisma } from "@db/prisma";
import { requireSession } from "@/lib/apiAuth";

export async function GET() {
  const { session, response } = await requireSession();
  if (!session) return response;

  const wallet = await prisma.wallet.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      balance: true,
      createdAt: true,
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          amount: true,
          type: true,
          description: true,
          createdAt: true,
        },
      },
    },
  });

  if (!wallet) {
    return Response.json(
      { ok: false, message: "Wallet not found" },
      { status: 404 },
    );
  }

  return Response.json({ ok: true, data: wallet, message: "Success" });
}
