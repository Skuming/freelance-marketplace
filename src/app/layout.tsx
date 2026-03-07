import type { ReactNode } from "react";
import "./globals.css";
import Providers from "./providers";
import "@fontsource/inter/latin.css";
import Box from "@mui/joy/Box";
import Footer from "@/widgets/footer/ui/Footer";
// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// export const metadata: Metadata = {
//   title: "Freelancer.com",
//   description: "Freelancer.com app",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>
        <Providers>
          <Box
            sx={{
              minHeight: "100dvh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box sx={{ flex: 1 }}>{children}</Box>
            <Footer />
          </Box>
        </Providers>
      </body>
    </html>
  );
}
