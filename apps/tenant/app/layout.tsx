import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TRPCReactProvider } from "@/trpc/react";
import { Toaster } from "@workspace/ui/components/sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import NextTopLoader from "nextjs-toploader";

import "@workspace/ui/globals.css";
import { Providers } from "@/components/providers";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "শিখনারী পোর্টাল",
  description: "শিখনারী বাৎসরিক পরিকল্পনা ও ডিজিটাল শিক্ষা সেবা ড্যাশবোর্ড",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" suppressHydrationWarning data-theme="shikhonary">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased `}
      >
        <NuqsAdapter>
          <TRPCReactProvider>
            <Providers>
              {children}
              <NextTopLoader showSpinner={false} color="#00e5a0" shadow="0 0 10px #00e5a0, 0 0 5px #00e5a0" />
              <Toaster position="top-right" />
            </Providers>
          </TRPCReactProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
