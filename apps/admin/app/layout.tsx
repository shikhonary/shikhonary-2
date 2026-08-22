import { Inter, Manrope, JetBrains_Mono } from "next/font/google"

import "@workspace/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TRPCReactProvider } from "@/trpc/client"
import { cn } from "@workspace/ui/lib/utils"

const fontSans = Inter({ subsets: ["latin"], variable: "--font-sans" })
const fontHeading = Manrope({ subsets: ["latin"], variable: "--font-heading" })
const fontMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" })

import { Toaster } from "@workspace/ui/components/sonner"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { ModalProvider } from "@/components/providers/modal-provider"

/**
 * Root layout — providers only.
 *
 * Auth is NOT checked here. Route-level protection is handled by:
 *  - `proxy.ts`                       — fast cookie gate (no session) → redirect to /auth/sign-in
 *  - `app/(dashboard)/layout.tsx`     — RSC session + SUPER_ADMIN role check before render
 *  - `adminProcedure` (tRPC)          — defense-in-depth on every API call
 *
 * Keeping this layout free of auth checks avoids wrapping public `/auth/*`
 * routes in any guard logic.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-theme="shikhonary"
      className={cn(
        "antialiased",
        fontSans.variable,
        fontHeading.variable,
        fontMono.variable,
      )}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <NuqsAdapter>
          <TRPCReactProvider>
            <ThemeProvider>
              {children}
              <ModalProvider />
              <Toaster />
            </ThemeProvider>
          </TRPCReactProvider>
        </NuqsAdapter>
      </body>
    </html>
  )
}
