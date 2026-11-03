import type { Metadata } from "next"
import { GoogleAnalytics } from "@next/third-parties/google"
import { Geist, Geist_Mono } from "next/font/google"
import { TooltipProvider } from "@/components/ui/tooltip"
import { GithubCorner } from "@/components/github-corner"
import { pageMetadata, SITE_NAME, SITE_URL } from "@/lib/site-metadata"
import "./globals.css"

const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  ...pageMetadata({ title: SITE_NAME, path: "/" }),
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="h-full overflow-hidden">
        <TooltipProvider>{children}</TooltipProvider>
        <GithubCorner />
      </body>
      <GoogleAnalytics gaId="G-2GBT7W2ER9" />
    </html>
  )
}
