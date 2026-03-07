import Header from "@/widgets/header/ui/Header";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@db/prisma";
import Box from "@mui/joy/Box";
import Card from "@mui/joy/Card";
import Chip from "@mui/joy/Chip";
import Container from "@mui/joy/Container";
import Stack from "@mui/joy/Stack";
import Typography from "@mui/joy/Typography";
import { ArrowRight, MessageSquareText } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ChatsPage({
  searchParams,
}: {
  searchParams?: Promise<{ orderId?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const resolvedSearchParams = await searchParams;
  const orderId = resolvedSearchParams?.orderId;

  if (orderId) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, customerId: true, freelancerId: true },
    });

    if (order) {
      const isParticipant =
        order.customerId === session.user.id ||
        order.freelancerId === session.user.id;

      if (isParticipant && order.freelancerId) {
        await prisma.chat.upsert({
          where: {
            orderId_customerId_freelancerId: {
              orderId: order.id,
              customerId: order.customerId,
              freelancerId: order.freelancerId,
            },
          },
          update: {},
          create: {
            orderId: order.id,
            customerId: order.customerId,
            freelancerId: order.freelancerId,
          },
        });
      }
    }
  }

  const chats = await prisma.chat.findMany({
    where: {
      OR: [{ customerId: session.user.id }, { freelancerId: session.user.id }],
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      order: { select: { id: true, title: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { text: true, createdAt: true },
      },
    },
  });

  return (
    <Box sx={{ minHeight: "100dvh" }}>
      <Header />
      <Container
        maxWidth="md"
        sx={{ py: { xs: 2, sm: 3 }, display: "flex", flexDirection: "column", gap: 2 }}
      >
        <Card variant="outlined" sx={{ borderRadius: "xl", p: 2.5 }}>
          <Typography
            level="h1"
            sx={{ fontSize: { xs: "1.5rem", sm: "1.8rem" } }}
            startDecorator={<MessageSquareText size={18} />}
          >
            Чаты
          </Typography>
          <Typography level="body-sm" sx={{ opacity: 0.8, mt: 0.5 }}>
            Переписка с заказчиками и исполнителями в реальном времени
          </Typography>
        </Card>

        {chats.length === 0 ? (
          <Card variant="soft" color="neutral" sx={{ borderRadius: "xl", p: 2 }}>
            <Typography level="body-sm" sx={{ opacity: 0.8 }}>
              Чатов пока нет. Они появятся, когда начнется работа по заказу.
            </Typography>
          </Card>
        ) : (
          <Stack spacing={1.25}>
            {chats.map((chat) => (
              <Link
                key={chat.id}
                href={`/chats/${chat.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: "xl",
                    p: 1.75,
                    transition: "0.2s ease",
                    "&:hover": {
                      borderColor: "primary.outlinedBorder",
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between" spacing={1}>
                      <Typography level="title-md">{chat.order.title}</Typography>
                      <ArrowRight size={16} />
                    </Stack>
                    <Typography level="body-sm" sx={{ opacity: 0.82 }}>
                      {chat.messages[0]?.text ?? "Сообщений пока нет"}
                    </Typography>
                    {chat.messages[0]?.createdAt ? (
                      <Chip size="sm" variant="soft" color="neutral" sx={{ width: "fit-content" }}>
                        {new Date(chat.messages[0].createdAt).toLocaleString("ru-RU")}
                      </Chip>
                    ) : null}
                  </Stack>
                </Card>
              </Link>
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  );
}
