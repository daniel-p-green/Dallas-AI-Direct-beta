"use client"

import { useEffect, useMemo, useState } from "react"
import { AttendeeCard, type Attendee } from "@/components/attendee-card"
import { MetricsStrip } from "@/components/metrics-strip"

/* ------------------------------------------------------------------ */
/* Seed data -- shown when live Neon-backed data is unavailable       */
/* ------------------------------------------------------------------ */
const SEED_ATTENDEES: Attendee[] = [
  {
    name: "Jordan Chen",
    title: "ML Engineer",
    company: "Vertex Labs",
    linkedin_url: "https://linkedin.com",
    ai_comfort_level: 4,
    help_offered: ["Mentoring", "Hiring"],
    created_at: new Date(Date.now() - 120_000).toISOString(),
  },
  {
    name: "Priya Sharma",
    title: "Product Lead",
    company: "Nexus AI",
    linkedin_url: "https://linkedin.com",
    ai_comfort_level: 5,
    help_offered: ["Partnering"],
    created_at: new Date(Date.now() - 60_000).toISOString(),
  },
  {
    name: "Marcus Rivera",
    linkedin_url: "https://linkedin.com",
    ai_comfort_level: 2,
    help_offered: ["Learning"],
    created_at: new Date(Date.now() - 30_000).toISOString(),
  },
  {
    name: "Sarah Kim",
    title: "CTO",
    company: "DataFlow",
    ai_comfort_level: 5,
    help_offered: ["Investing", "Mentoring"],
    created_at: new Date(Date.now() - 3_000).toISOString(),
  },
  {
    name: "Alex Thompson",
    title: "Founder",
    company: "AI Studio",
    linkedin_url: "https://linkedin.com",
    ai_comfort_level: 3,
    help_offered: ["Hiring", "Partnering"],
    created_at: new Date(Date.now() - 180_000).toISOString(),
  },
  {
    name: "Lisa Wong",
    title: "Data Scientist",
    company: "TechCorp",
    ai_comfort_level: 4,
    help_offered: ["Mentoring", "Learning"],
    created_at: new Date(Date.now() - 240_000).toISOString(),
  },
]

const FILTERS = [
  "All",
  "Hiring",
  "Mentoring",
  "Partnering",
  "Investing",
  "Learning",
  "Selling",
] as const

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
export function RoomBoard() {
  const fallback = useMemo(
    () =>
      [...SEED_ATTENDEES].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
    []
  )

  const [attendees, setAttendees] = useState<Attendee[]>(fallback)
  const [dataMode, setDataMode] = useState<"live" | "seed">("seed")
  const [notice, setNotice] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<string>("All")
  const [activeEvent, setActiveEvent] = useState<{ id: string; slug: string; name: string } | null>(null)
  const [aggregates, setAggregates] = useState<{
    attendeeCount: number
    averageComfort: number
    highComfortPct: number
    comfortDistribution?: Record<`level${1 | 2 | 3 | 4 | 5}`, number>
  }>({
    attendeeCount: fallback.length,
    averageComfort:
      fallback.length > 0
        ? Number(
            (
              fallback.reduce((sum, attendee) => sum + attendee.ai_comfort_level, 0) /
              fallback.length
            ).toFixed(1)
          )
        : 0,
    highComfortPct:
      fallback.length > 0
        ? Math.round(
            (fallback.filter((attendee) => attendee.ai_comfort_level >= 4).length /
              fallback.length) *
              100
          )
        : 0,
  })

  /* ---- Filtered list ---- */
  const filtered = useMemo(() => {
    let list = attendees
    if (filter !== "All") {
      list = list.filter((a) => a.help_offered.includes(filter))
    }
    const q = search.trim().toLowerCase()
    if (q.length > 0) {
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.title?.toLowerCase().includes(q) ||
          a.company?.toLowerCase().includes(q)
      )
    }
    return list
  }, [attendees, filter, search])

  /* ---- Polling via API route ---- */
  useEffect(() => {
    let active = true

    async function load() {
      try {
        const res = await fetch("/api/attendees/public", { cache: "no-store" })
        const json = (await res
          .json()
          .catch(() => ({}))) as {
          error?: string
          data?: Record<string, unknown>[]
          event?: { id: string; slug: string; name: string } | null
          aggregates?: {
            attendeeCount: number
            averageComfort: number
            highComfortPct: number
            comfortDistribution?: Record<`level${1 | 2 | 3 | 4 | 5}`, number>
          }
        }

        if (!res.ok || !json.data) {
          if (active) {
            setDataMode("seed")
            setNotice("Live data unavailable. Showing sample data.")
            setAttendees(fallback)
            setActiveEvent(null)
            setAggregates({
              attendeeCount: fallback.length,
              averageComfort:
                fallback.length > 0
                  ? Number(
                      (
                        fallback.reduce((sum, attendee) => sum + attendee.ai_comfort_level, 0) /
                        fallback.length
                      ).toFixed(1)
                    )
                  : 0,
              highComfortPct:
                fallback.length > 0
                  ? Math.round(
                      (fallback.filter((attendee) => attendee.ai_comfort_level >= 4).length /
                        fallback.length) *
                        100
                    )
                  : 0,
            })
          }
          return
        }

        const mapped: Attendee[] = (json.data as Record<string, unknown>[]).map((row) => ({
          name:
            typeof row.name === "string" && row.name.trim().length > 0
              ? row.name
              : "Attendee",
          title: typeof row.title === "string" ? row.title : undefined,
          company: typeof row.company === "string" ? row.company : undefined,
          linkedin_url:
            typeof row.linkedin_url === "string" ? row.linkedin_url : undefined,
          ai_comfort_level:
            typeof row.ai_comfort_level === "number"
              ? row.ai_comfort_level
              : 1,
          help_offered: Array.isArray(row.help_offered)
            ? row.help_offered.filter(
                (v: unknown): v is string => typeof v === "string"
              )
            : [],
          created_at:
            typeof row.created_at === "string"
              ? row.created_at
              : new Date().toISOString(),
        }))

        if (active) {
          setDataMode("live")
          setNotice(null)
          setAttendees(mapped)
          setActiveEvent(json.event ?? null)
          setAggregates(
            json.aggregates ?? {
              attendeeCount: mapped.length,
              averageComfort:
                mapped.length > 0
                  ? Number(
                      (
                        mapped.reduce((sum, attendee) => sum + attendee.ai_comfort_level, 0) /
                        mapped.length
                      ).toFixed(1)
                    )
                  : 0,
              highComfortPct:
                mapped.length > 0
                  ? Math.round(
                      (mapped.filter((attendee) => attendee.ai_comfort_level >= 4).length /
                        mapped.length) *
                        100
                    )
                  : 0,
            }
          )
        }
      } catch {
        if (active) {
          setDataMode("seed")
          setNotice("Live data unavailable. Showing sample data.")
          setAttendees(fallback)
          setActiveEvent(null)
          setAggregates({
            attendeeCount: fallback.length,
            averageComfort:
              fallback.length > 0
                ? Number(
                    (
                      fallback.reduce((sum, attendee) => sum + attendee.ai_comfort_level, 0) /
                      fallback.length
                    ).toFixed(1)
                  )
                : 0,
            highComfortPct:
              fallback.length > 0
                ? Math.round(
                    (fallback.filter((attendee) => attendee.ai_comfort_level >= 4).length /
                      fallback.length) *
                      100
                  )
                : 0,
          })
        }
      }
    }

    setReady(true)
    load()
    const interval = setInterval(load, 5000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [fallback])

  /* ---- Render ---- */
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-8 md:py-12">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Directory
          </h1>
          <span
            className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-[3px]"
            aria-label={dataMode === "live" ? "Live data" : "Sample data"}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                dataMode === "live"
                  ? "bg-[hsl(var(--success))]"
                  : "bg-muted-foreground"
              }`}
            />
            <span className="text-[11px] font-medium text-muted-foreground">
              {dataMode === "live" ? "Live" : "Sample"}
            </span>
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {ready
            ? `${aggregates.attendeeCount} attendee${aggregates.attendeeCount !== 1 ? "s" : ""} in the room`
            : "Loading attendees\u2026"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Session: {activeEvent?.name ?? "Legacy (no active event)"}
        </p>
      </div>

      {/* Notice */}
      {notice && (
        <p
          className="mb-6 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground"
          role="status"
        >
          {notice}
        </p>
      )}

      {/* Metrics */}
      <div className="mb-6">
        <MetricsStrip
          attendees={attendees}
          summary={{
            attendeeCount: aggregates.attendeeCount,
            averageComfort: aggregates.averageComfort,
            highComfortPct: aggregates.highComfortPct,
          }}
        />
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <label htmlFor="attendee-search" className="sr-only">
          Search attendees
        </label>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          id="attendee-search"
          type="search"
          placeholder="Search by name, title, or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input pl-11"
        />
      </div>

      {/* Filter chips */}
      <div
        className="-mx-5 mb-6 flex gap-2 overflow-x-auto px-5 pb-1 scrollbar-none"
        role="group"
        aria-label="Filter by help type"
      >
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            data-active={filter === f ? "true" : "false"}
            className="chip"
          >
            {f}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-3" role="list">
        {filtered.map((a) => {
          const isNew =
            ready && Date.now() - new Date(a.created_at).getTime() <= 5000
          return (
            <div role="listitem" key={`${a.name}-${a.created_at}`}>
              <AttendeeCard attendee={a} isNew={isNew} />
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-muted-foreground"
                aria-hidden="true"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">
              {search || filter !== "All"
                ? "No attendees match your filters."
                : "No attendees yet. Be the first to join."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
