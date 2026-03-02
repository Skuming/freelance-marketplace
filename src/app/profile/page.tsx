import Header from "@/widgets/header/ui/Header";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@db/prisma";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

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
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-2xl mx-auto p-4 flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Профиль</h1>

        <div className="border rounded-lg p-4 flex flex-col gap-2">
          <div className="text-sm opacity-70">Email</div>
          <div className="font-semibold">{user.email}</div>
          <div className="text-sm opacity-70">Роль</div>
          <div className="font-semibold">{user.role}</div>
          <div className="text-sm opacity-70">Баланс</div>
          <div className="font-semibold">{user.wallet?.balance ?? 0} ₽</div>
        </div>

        <div className="border rounded-lg p-4 flex flex-col gap-3">
          <div className="font-semibold">Настройки профиля</div>
          <ProfileForm initialName={user.name} />
        </div>
      </main>
    </div>
  );
}
