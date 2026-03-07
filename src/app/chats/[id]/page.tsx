import Header from "@/widgets/header/ui/Header";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@db/prisma";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Card from "@mui/joy/Card";
import Container from "@mui/joy/Container";
import Stack from "@mui/joy/Stack";
import Typography from "@mui/joy/Typography";
import { MessageSquareText } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import ChatRoom from "./ChatRoom";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const { id } = await params;

  const chat = await prisma.chat.findUnique({
    where: { id },
    select: {
      id: true,
      order: { select: { id: true, title: true } },
      customerId: true,
      freelancerId: true,
      messages: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          text: true,
          createdAt: true,
          senderId: true,
          sender: { select: { id: true, email: true, name: true } },
        },
      },
    },
  });

  if (!chat) notFound();

  const isParticipant =
    chat.customerId === session.user.id ||
    chat.freelancerId === session.user.id;

  if (!isParticipant) {
    redirect("/");
  }

  return (
    <Box sx={{ minHeight: "100dvh" }}>
      <Header />
      <Container
        maxWidth="md"
        sx={{ py: { xs: 2, sm: 3 }, display: "flex", flexDirection: "column", gap: 2 }}
      >
        <Card variant="outlined" sx={{ borderRadius: "xl", p: 2 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            spacing={1.25}
          >
            <Stack spacing={0.5}>
              <Typography level="h1" sx={{ fontSize: "1.55rem" }}>
                <Stack direction="row" alignItems="center" spacing={0.75}>
                  <MessageSquareText size={18} />
                  <span>Чат</span>
                </Stack>
              </Typography>
              <Typography level="body-sm" sx={{ opacity: 0.8 }}>
                Живой диалог по заказу
              </Typography>
            </Stack>
            <Button
              component={Link}
              href={`/orders/${chat.order.id}`}
              variant="outlined"
              color="neutral"
              size="sm"
            >
              {chat.order.title}
            </Button>
          </Stack>
        </Card>

        <ChatRoom
          chatId={chat.id}
          currentUserId={session.user.id}
          initialMessages={chat.messages}
        />
      </Container>
    </Box>
  );
}
