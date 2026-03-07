import Box from "@mui/joy/Box";
import Container from "@mui/joy/Container";
import Divider from "@mui/joy/Divider";
import Link from "@mui/joy/Link";
import Stack from "@mui/joy/Stack";
import Typography from "@mui/joy/Typography";
import { Github, Workflow } from "lucide-react";

const Footer = () => {
  return (
    <Box sx={{ mt: 4 }}>
      <Divider />
      <Container
        maxWidth="lg"
        sx={{
          py: 2,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Typography level="body-sm" sx={{ opacity: 0.72 }}>
          <Stack direction="row" alignItems="center" spacing={0.6}>
            <Workflow size={15} />
            <span>Freelancer.com • {new Date().getFullYear()}</span>
          </Stack>
        </Typography>

        <Link
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          underline="none"
          sx={{ display: "inline-flex", alignItems: "center", gap: 0.6, opacity: 0.72 }}
        >
          <Github size={14} />
          Репозиторий
        </Link>
      </Container>
    </Box>
  );
};

export default Footer;
