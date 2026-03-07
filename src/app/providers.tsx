"use client";

import { SessionProvider } from "next-auth/react";
import { Provider } from "react-redux";
import { store } from "@/lib/redux/store";
import { CssBaseline } from "@mui/joy";
import { CssVarsProvider, extendTheme } from "@mui/joy/styles";
import type { ReactNode } from "react";

const theme = extendTheme({
  fontFamily: {
    body: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
    display:
      "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
    code: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
  colorSchemes: {
    light: {
      palette: {
        primary: {
          solidBg: "#14a800",
          solidHoverBg: "#0e7a00",
          solidActiveBg: "#0a5a00",
          outlinedBorder: "rgba(20, 168, 0, 0.45)",
          outlinedColor: "#0e7a00",
          softColor: "#0e7a00",
          softBg: "rgba(20, 168, 0, 0.10)",
          softHoverBg: "rgba(20, 168, 0, 0.16)",
        },
      },
    },
    dark: {
      palette: {
        primary: {
          solidBg: "#22c55e",
          solidHoverBg: "#16a34a",
          solidActiveBg: "#15803d",
          outlinedBorder: "rgba(34, 197, 94, 0.5)",
          outlinedColor: "#86efac",
          softColor: "#86efac",
          softBg: "rgba(34, 197, 94, 0.14)",
          softHoverBg: "rgba(34, 197, 94, 0.22)",
        },
      },
    },
  },
});

export default function Providers({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <CssVarsProvider theme={theme} defaultMode="system">
      <CssBaseline />
      <Provider store={store}>
        <SessionProvider>{children}</SessionProvider>
      </Provider>
    </CssVarsProvider>
  );
}
