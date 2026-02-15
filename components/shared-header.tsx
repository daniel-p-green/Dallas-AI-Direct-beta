"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export function SharedHeader() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const showAdminNav = process.env.NEXT_PUBLIC_SHOW_ADMIN_NAV === "true"

  /* Close menu on route change */
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <nav
        className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-3"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="focus-ring flex items-center gap-2.5 rounded-md"
        >
          <Image
            src="/brand/dallas-ai-logo-white.png"
            alt=""
            width={120}
            height={32}
            priority
            className="h-7 w-auto"
          />
          <span className="sr-only">Dallas AI Direct</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1.5 sm:flex">
          <NavLink href="/signup" active={pathname === "/signup"}>
            Sign Up
          </NavLink>
          <NavLink href="/room" active={pathname === "/room"}>
            Directory
          </NavLink>
          {showAdminNav && (
            <NavLink href="/admin" active={pathname === "/admin"}>
              Admin
            </NavLink>
          )}
          <a
            href="https://dallas-ai.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring ml-1 inline-flex h-8 items-center justify-center rounded-full bg-foreground px-4 text-xs font-semibold text-background transition-opacity hover:opacity-80 active:scale-[0.97]"
          >
            Join Dallas AI
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="focus-ring flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-secondary sm:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="border-t border-border/60 px-5 pb-4 pt-2 sm:hidden">
          <div className="flex flex-col gap-1">
            <MobileNavLink href="/signup" active={pathname === "/signup"}>
              Sign Up
            </MobileNavLink>
            <MobileNavLink href="/room" active={pathname === "/room"}>
              Directory
            </MobileNavLink>
            {showAdminNav && (
              <MobileNavLink href="/admin" active={pathname === "/admin"}>
                Admin
              </MobileNavLink>
            )}
          </div>
          <a
            href="https://dallas-ai.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring mt-3 inline-flex h-9 w-full items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background transition-opacity hover:opacity-80 active:scale-[0.98]"
          >
            Join Dallas AI
          </a>
        </div>
      )}
    </header>
  )
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`focus-ring rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
        active
          ? "bg-secondary text-foreground"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  )
}

function MobileNavLink({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`focus-ring rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
        active
          ? "bg-secondary text-foreground"
          : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  )
}
