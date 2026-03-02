import Header from "@/widgets/header/ui/Header";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import NewOrderForm from "./NewOrderForm";

export default async function NewOrderPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "CUSTOMER") {
    redirect("/");
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-3xl mx-auto p-4 sm:p-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl font-semibold">Новый заказ</h1>
          <div className="text-sm opacity-80">
            Этот заказ увидят только фрилансеры
          </div>
        </div>
        <NewOrderForm />
      </main>
    </div>
  );
}
