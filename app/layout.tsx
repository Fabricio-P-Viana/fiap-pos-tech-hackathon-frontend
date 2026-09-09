import type { Metadata } from "next";
import { mantineHtmlProps } from "@mantine/core";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import { FixedHeader } from "../components/fixed-header";
import { AppProviders } from "./providers";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "./globals.css";
import { HomeFooter } from "../components/footer";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Resolve Aí",
  description: "Plataforma de gestão de ocorrências.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased" {...mantineHtmlProps}>
      <body
        className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} min-h-full`}
      >
        <a className="skip-link" href="#conteudo-principal">
          Pular para o conteúdo
        </a>
        <AppProviders>
          <FixedHeader />
          <div className="page-shell">{children}</div>
          <HomeFooter />
        </AppProviders>
      </body>
    </html>
  );
}
