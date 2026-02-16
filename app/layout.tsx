import type { ReactNode } from "react"
import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { OptionalClerkProvider } from "@/components/optional-clerk-provider"
import { SharedHeader } from "@/components/shared-header"
import { SharedFooter } from "@/components/shared-footer"
import "./globals.css"

export const metadata: Metadata = {
  title: "Dallas AI Direct Beta",
  description:
    "Connecting 10,000+ minds building the future of AI in Dallas. The live directory for Dallas AI events.",
}

export const viewport: Viewport = {
  themeColor: "#0d0d0d",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const showEnvironmentBanner = process.env.NEXT_PUBLIC_SHOW_ENV_BANNER === "true"
  const attendeeAuthEnabled =
    process.env.NEXT_PUBLIC_ATTENDEE_AUTH_REQUIRED === 'true' &&
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY)

  const shell = (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      {showEnvironmentBanner ? (
        <div
          className="grid grid-cols-3 gap-2 border-b border-border/60 bg-black px-3 py-2 text-center text-[11px] font-semibold tracking-wide text-white"
          role="status"
          aria-label="environment banner"
        >
          <span>BETA DEMO</span>
          <span>ENV: STAGE</span>
          <span>PUBLIC VIEW SAFE</span>
        </div>
      ) : null}
      <SharedHeader />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SharedFooter />
    </>
  )

  return (
    <html
      lang="en"
      className={`dark ${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col font-sans">
        <OptionalClerkProvider enabled={attendeeAuthEnabled}>{shell}</OptionalClerkProvider>
      </body>
    </html>
  )
}
