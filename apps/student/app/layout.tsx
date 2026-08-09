import { Inter, Manrope, JetBrains_Mono } from "next/font/google"

import "@workspace/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TRPCReactProvider } from "@/trpc/client"
import { cn } from "@workspace/ui/lib/utils"

const fontSans = Inter({ subsets: ["latin"], variable: "--font-sans" })
const fontHeading = Manrope({ subsets: ["latin"], variable: "--font-heading" })
const fontMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
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
        <TRPCReactProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  )
}
