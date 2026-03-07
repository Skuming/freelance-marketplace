import Header from "@/widgets/header/ui/Header";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@db/prisma";
import Box from "@mui/joy/Box";
import Card from "@mui/joy/Card";
import Chip from "@mui/joy/Chip";
import Container from "@mui/joy/Container";
import Stack from "@mui/joy/Stack";
import Typography from "@mui/joy/Typography";
import { BadgeDollarSign, WalletMinimal } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
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
    <Box sx={{ minHeight: "100dvh" }}>
      <Header />
      <Container
        maxWidth="md"
        sx={{ py: { xs: 2, sm: 3 }, display: "flex", flexDirection: "column", gap: 2 }}
      >
        <Card variant="outlined" sx={{ borderRadius: "xl", p: 2.25 }}>
          <Typography
            level="h1"
            sx={{ fontSize: { xs: "1.55rem", sm: "1.85rem" } }}
            startDecorator={<WalletMinimal size={18} />}
          >
            Кошелек
          </Typography>
          <Typography level="body-sm" sx={{ opacity: 0.8, mt: 0.5 }}>
            Управление балансом и история пополнений
          </Typography>
        </Card>

        <Card variant="soft" color="success" sx={{ borderRadius: "xl", p: 2 }}>
          <Typography level="body-sm" sx={{ opacity: 0.85 }}>
            Текущий баланс
          </Typography>
          <Typography level="h2" sx={{ fontSize: "2rem", mt: 0.35 }}>
            {wallet.balance} ₽
          </Typography>
        </Card>

        <Card variant="outlined" sx={{ borderRadius: "xl", p: 2 }}>
          <Typography level="title-md" sx={{ mb: 1 }}>
            Пополнение
          </Typography>
          <DepositForm />
        </Card>

        <Card variant="outlined" sx={{ borderRadius: "xl", p: 2 }}>
          <Typography level="title-md" sx={{ mb: 1 }}>
            История
          </Typography>
          {wallet.transactions.length === 0 ? (
            <Typography level="body-sm" sx={{ opacity: 0.75 }}>
              Транзакций пока нет
            </Typography>
          ) : (
            <Stack spacing={1}>
              {wallet.transactions.map((tx) => (
                <Card key={tx.id} variant="soft" color="neutral" sx={{ borderRadius: "lg", p: 1.2 }}>
                  <Stack direction="row" justifyContent="space-between" spacing={1}>
                    <Stack spacing={0.35}>
                      <Typography level="title-sm">
                        {tx.description ?? tx.type}
                      </Typography>
                      <Typography level="body-xs" sx={{ opacity: 0.72 }}>
                        {new Date(tx.createdAt).toLocaleString("ru-RU")}
                      </Typography>
                    </Stack>
                    <Chip
                      size="sm"
                      color="success"
                      variant="soft"
                      startDecorator={<BadgeDollarSign size={14} />}
                    >
                      +{tx.amount} ₽
                    </Chip>
                  </Stack>
                </Card>
              ))}
            </Stack>
          )}
        </Card>
      </Container>
    </Box>
  );
}
