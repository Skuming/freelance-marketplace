import Header from "@/widgets/header/ui/Header";
import { authOptions } from "@/lib/authOptions";
import Box from "@mui/joy/Box";
import Card from "@mui/joy/Card";
import Container from "@mui/joy/Container";
import Stack from "@mui/joy/Stack";
import Typography from "@mui/joy/Typography";
import { FilePlus2 } from "lucide-react";
import { getServerSession } from "next-auth";
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
    <Box sx={{ minHeight: "100dvh" }}>
      <Header />
      <Container
        maxWidth="md"
        sx={{ py: { xs: 2, sm: 3 }, display: "flex", flexDirection: "column", gap: 2 }}
      >
        <Card variant="outlined" sx={{ borderRadius: "xl", p: 2.25 }}>
          <Stack spacing={0.45}>
            <Typography
              level="h1"
              sx={{ fontSize: { xs: "1.5rem", sm: "1.8rem" } }}
              startDecorator={<FilePlus2 size={18} />}
            >
              Новый заказ
            </Typography>
            <Typography level="body-sm" sx={{ opacity: 0.8 }}>
              Опишите задачу. Заказ увидят исполнители и смогут взять в работу.
            </Typography>
          </Stack>
        </Card>
        <NewOrderForm />
      </Container>
    </Box>
  );
}
