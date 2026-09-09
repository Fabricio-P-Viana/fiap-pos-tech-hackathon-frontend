"use client";

import { MantineProvider, createTheme } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

const theme = createTheme({
  fontFamily: "var(--font-space-grotesk), sans-serif",
  fontFamilyMonospace: "var(--font-ibm-plex-mono), monospace",
  primaryColor: "dark",
  defaultRadius: "md",
  headings: {
    fontFamily: "var(--font-space-grotesk), sans-serif",
    fontWeight: "700",
  },
  components: {
    Paper: {
      defaultProps: {
        withBorder: true,
        radius: "md",
        shadow: "xs",
      },
    },
    TextInput: {
      defaultProps: {
        radius: "xl",
        size: "md",
      },
    },
  },
});

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <MantineProvider theme={theme} defaultColorScheme="light">
        <Notifications />
        {children}
      </MantineProvider>
    </SessionProvider>
  );
}
