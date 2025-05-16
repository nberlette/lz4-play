import type React from "react"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata = {
  title: "LZ4 Compression Playground - @nick/lz4",
  description: "Compress and decompress files with the LZ4 algorithm, right in your browser! Featuring performance benchmarks and a variety of data visualizations for you to nerd out on.",
  author: "Nicholas Berlette",
  openGraph: {
    site_name: "LZ4 Playground",
    images: ["https://raw.githubusercontent.com/nberlette/lz4-wasm/main/.github/assets/banner_light.webp"],
    url: "https://lz4-play.vercel.app",
  },
  twitter: {
    images: ["https://raw.githubusercontent.com/nberlette/lz4-wasm/main/.github/assets/banner_light.webp"],
    card: "summary_large_image",
    url: "https://lz4-play.vercel.app",
    creator: "@nberlette",
  },
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
