import Header from "@/widgets/header/ui/Header";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@db/prisma";
import DepositForm from "./DepositForm";

export default async function WalletPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const wallet = await prisma.wallet.findUnique({
    where: { userId: session.user.id },
    select: {
      balance: true,
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
    redirect("/");
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-3xl mx-auto p-4 flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Кошелёк</h1>

        <div className="border rounded-lg p-4">
          <div className="text-sm opacity-70">Баланс</div>
          <div className="text-3xl font-semibold">{wallet.balance} ₽</div>
        </div>

        <div className="border rounded-lg p-4 flex flex-col gap-3">
          <div className="font-semibold">Пополнение</div>
          <DepositForm />
        </div>

        <div className="border rounded-lg p-4 flex flex-col gap-2">
          <div className="font-semibold">История</div>
          {wallet.transactions.map((t) => (
            <div key={t.id} className="flex justify-between text-sm">
              <div>{t.description ?? t.type}</div>
              <div>+{t.amount} ₽</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
