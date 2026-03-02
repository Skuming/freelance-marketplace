import { prisma } from "@db/prisma";
import { requireSession } from "@/lib/apiAuth";

export async function POST(req: Request) {
  const { session, response } = await requireSession();
  if (!session) return response;

  const body = await req.json();
  const amount = Number(body?.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    return Response.json(
      { ok: false, message: "Invalid amount" },
      { status: 400 },
    );
  }

  const wallet = await prisma.wallet.findUnique({
    where: { userId: session.user.id },
    select: { id: true, balance: true },
  });

  if (!wallet) {
    return Response.json(
      { ok: false, message: "Wallet not found" },
      { status: 404 },
    );
  }

  const updated = await prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.create({
      data: {
        walletId: wallet.id,
        amount: Math.trunc(amount),
        type: "DEPOSIT",
        description: "Пополнение",
      },
      select: { id: true, amount: true, type: true, createdAt: true },
    });

    const walletUpdated = await tx.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: {
          increment: Math.trunc(amount),
        },
      },
      select: { id: true, balance: true },
    });

    return { wallet: walletUpdated, transaction };
  });

  return Response.json(
    { ok: true, data: updated, message: "Deposited" },
    { status: 201 },
  );
}
