import Image from "next/image"

export function SharedFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-5 py-6 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Image
            src="/brand/dallas-ai-logo-white.png"
            alt="Dallas AI Direct"
            width={80}
            height={22}
            unoptimized
            className="h-5 w-auto opacity-70"
          />
          <span className="h-3 w-px bg-border" aria-hidden="true" />
          <span className="flex items-center gap-1.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Email never displayed
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            Built by{" "}
            <a
              href="https://www.linkedin.com/in/danielpgreen"
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring inline-flex min-h-11 items-center rounded-sm px-1 font-medium text-foreground underline decoration-border underline-offset-2 transition-colors hover:decoration-foreground"
            >
              Daniel Green
            </a>
          </span>
          <span className="h-3 w-px bg-border" aria-hidden="true" />
          <a
            href="https://v0.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring flex min-h-11 items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Built with v0 by Vercel"
          >
            <span>Built with</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M14 2L26 26H2L14 2Z" fill="currentColor" />
            </svg>
            <span className="font-semibold">v0</span>
          </a>
        </div>
      </div>
    </footer>
  )
}
