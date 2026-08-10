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
  title: "ইউনিয়ন পরিষদ পোর্টাল",
  description: "ইউনিয়ন পরিষদ বাৎসরিক পরিকল্পনা ও ডিজিটাল সেবা ড্যাশবোর্ড",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" suppressHydrationWarning>
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
