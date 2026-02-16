import { ComfortDots } from "@/components/comfort-dots"
import { LinkedinIcon } from "@/components/linkedin-icon"

export type Attendee = {
  name: string
  title?: string
  company?: string
  linkedin_url?: string
  ai_comfort_level: number
  help_offered: string[]
  created_at: string
}

const COMFORT_LABELS: Record<number, string> = {
  1: "Exploring",
  2: "Learning",
  3: "Building",
  4: "Shipping",
  5: "Leading",
}

export function getSafeHttpUrl(value: string | undefined) {
  if (!value) {
    return null
  }

  try {
    const parsed = new URL(value)
    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? parsed.toString()
      : null
  } catch {
    return null
  }
}

export function AttendeeCard({
  attendee,
  isNew,
}: {
  attendee: Attendee
  isNew: boolean
}) {
  const subtitle =
    [attendee.title, attendee.company].filter(Boolean).join(" at ") || null
  const initials = attendee.name
    .split(" ")
    .map((w) => w.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase()
  const safeLinkedinUrl = getSafeHttpUrl(attendee.linkedin_url)

  return (
    <article
      className={`rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-secondary/40 ${
        isNew ? "just-joined card-enter" : ""
      }`}
      aria-label={`${attendee.name}, ${
        COMFORT_LABELS[attendee.ai_comfort_level] ?? ""
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Avatar */}
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-[13px] font-semibold text-accent-foreground"
          aria-hidden="true"
        >
          {initials}
        </div>

        {/* Info */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-2">
            <span className="truncate text-[15px] font-semibold leading-snug">
              {attendee.name}
            </span>
            {safeLinkedinUrl ? (
              <a
                href={safeLinkedinUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={`${attendee.name} on LinkedIn`}
                className="focus-ring inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <LinkedinIcon size={14} />
              </a>
            ) : (
              <span
                aria-label="LinkedIn profile unavailable"
                className="shrink-0 rounded-sm text-muted-foreground"
              >
                <LinkedinIcon size={14} />
              </span>
            )}
          </div>

          {subtitle && (
            <span className="mt-0.5 truncate text-sm leading-snug text-muted-foreground">
              {subtitle}
            </span>
          )}

          {/* Comfort */}
          <div className="mt-2 flex items-center gap-2.5">
            <ComfortDots level={attendee.ai_comfort_level} />
            <span className="text-xs font-medium text-muted-foreground">
              {COMFORT_LABELS[attendee.ai_comfort_level] ??
                `Level ${attendee.ai_comfort_level}`}
            </span>
          </div>
        </div>
      </div>

      {/* Help tags */}
      {attendee.help_offered.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5 pl-0 sm:pl-[58px]">
          {attendee.help_offered.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-accent px-2.5 py-[3px] text-[11px] font-medium leading-none text-accent-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  )
}
