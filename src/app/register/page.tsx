import Box from "@mui/joy/Box";
import Card from "@mui/joy/Card";
import Container from "@mui/joy/Container";
import Stack from "@mui/joy/Stack";
import Typography from "@mui/joy/Typography";
import { UserPlus, Workflow } from "lucide-react";
import RegisterForm from "./RegisterForm";

const Register = () => {
  return (
    <Box sx={{ minHeight: "100dvh", display: "grid", placeItems: "center", px: 2 }}>
      <Container maxWidth="sm">
        <Stack spacing={1.5}>
          <Card variant="soft" color="primary" sx={{ borderRadius: "xl", p: 2 }}>
            <Stack spacing={0.35}>
              <Typography level="title-md" startDecorator={<Workflow size={16} />}>
                Freelancer.com
              </Typography>
              <Typography level="body-sm" sx={{ opacity: 0.9 }}>
                Создайте аккаунт и начните работу
              </Typography>
            </Stack>
          </Card>

          <Card variant="outlined" sx={{ borderRadius: "xl", p: 2.25 }}>
            <Stack spacing={0.5} sx={{ mb: 1 }}>
              <Typography level="h2" sx={{ fontSize: "1.55rem" }}>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <UserPlus size={18} />
                  <span>Регистрация</span>
                </Stack>
              </Typography>
              <Typography level="body-sm" sx={{ opacity: 0.8 }}>
                Выберите роль и заполните данные
              </Typography>
            </Stack>
            <RegisterForm />
          </Card>
        </Stack>
      </Container>
    </Box>
  );
};

export default Register;
