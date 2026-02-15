"use client"

import Link from "next/link"
import { type FormEvent, useState } from "react"

const HELP_OPTIONS = [
  "Hiring",
  "Mentoring",
  "Partnering",
  "Investing",
  "Learning",
  "Selling",
  "Other",
] as const

function normalize(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null
  const t = value.trim()
  return t.length > 0 ? t : null
}

type Status =
  | { type: "idle" | "submitting" }
  | { type: "success" | "error"; message: string }

/* ------------------------------------------------------------------ */
/* Form                                                                */
/* ------------------------------------------------------------------ */
export function SignupForm() {
  const [status, setStatus] = useState<Status>({ type: "idle" })
  const [helpNeeded, setHelpNeeded] = useState<string[]>([])
  const [helpOffered, setHelpOffered] = useState<string[]>([])

  function toggle(
    list: string[],
    setter: (v: string[]) => void,
    value: string
  ) {
    setter(
      list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
    )
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const fd = new FormData(e.currentTarget)

    /* Honeypot */
    const hp = String(fd.get("honeypot") ?? "").trim()
    if (hp.length > 0) {
      setStatus({
        type: "success",
        message: "Thanks for joining! You should appear on the directory shortly.",
      })
      e.currentTarget.reset()
      return
    }

    const payload = {
      name: String(fd.get("name") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      linkedin_url: normalize(fd.get("linkedin_url")),
      title: normalize(fd.get("title")),
      company: normalize(fd.get("company")),
      display_title_company: fd.get("display_title_company") === "on",
      ai_comfort_level: Number(fd.get("ai_comfort_level") ?? 3),
      help_needed: helpNeeded,
      help_offered: helpOffered,
      honeypot: "",
      other_help_needed: null,
      other_help_offered: null,
    }

    setStatus({ type: "submitting" })

    try {
      const res = await fetch("/api/attendees/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = (await res
        .json()
        .catch(() => ({}))) as { error?: string; code?: string; event?: { name?: string } | null }

      if (!res.ok) {
        const errorMessage =
          json.error ||
          (json.code === "CHECK_IN_WINDOW_CLOSED"
            ? "Check-in is currently closed for the active event session."
            : "Something went wrong. Please try again.")
        setStatus({
          type: "error",
          message: errorMessage,
        })
        return
      }

      setStatus({
        type: "success",
        message: json.event?.name
          ? `Checked in for ${json.event.name}. You should appear on the directory shortly.`
          : "You should appear on the directory shortly.",
      })
      e.currentTarget.reset()
      setHelpNeeded([])
      setHelpOffered([])
    } catch {
      setStatus({
        type: "error",
        message: "Something went wrong. Please try again.",
      })
    }
  }

  /* ---- Success ---- */
  if (status.type === "success") {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-5 py-20 text-center md:py-28">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--success)/0.15)]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="hsl(var(--success))"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">
          {"You're in."}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{status.message}</p>
        <Link
          href="/room"
          className="focus-ring mt-8 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-[13px] font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:brightness-110 active:scale-[0.98]"
        >
          View Directory
        </Link>
      </div>
    )
  }

  /* ---- Form ---- */
  return (
    <div className="mx-auto max-w-lg px-5 py-8 md:py-14">
      <div className="mb-10">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Join Dallas AI Direct
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
          Share your signal so others know who to connect with.
          Your email stays private.
        </p>
      </div>

      <form className="flex flex-col gap-8" onSubmit={handleSubmit} noValidate>
        {/* Honeypot */}
        <div aria-hidden="true" className="absolute -left-[9999px]">
          <label htmlFor="website">Website</label>
          <input
            id="website"
            name="honeypot"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* Name */}
        <Field label="Name" required>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="Your full name"
            className="form-input"
          />
        </Field>

        {/* Email */}
        <Field label="Email" hint="Never displayed publicly" required>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@company.com"
            className="form-input"
          />
        </Field>

        {/* AI Comfort Level */}
        <Field label="AI Comfort Level" required>
          <fieldset>
            <legend className="sr-only">Select your AI comfort level</legend>
            <div className="grid grid-cols-5 gap-2">
              {[
                { v: 1, sub: "Exploring" },
                { v: 2, sub: "Learning" },
                { v: 3, sub: "Building" },
                { v: 4, sub: "Shipping" },
                { v: 5, sub: "Leading" },
              ].map((opt) => (
                <label key={opt.v} className="group cursor-pointer">
                  <input
                    type="radio"
                    name="ai_comfort_level"
                    value={opt.v}
                    defaultChecked={opt.v === 3}
                    className="peer sr-only"
                  />
                  <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card p-3 text-center transition-all peer-checked:border-primary peer-checked:bg-accent peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background hover:bg-secondary active:scale-[0.97]">
                    <span className="text-lg font-bold leading-none">
                      {opt.v}
                    </span>
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {opt.sub}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </fieldset>
        </Field>

        {/* Help needed */}
        <Field label="What help do you need?">
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Help needed"
          >
            {HELP_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                aria-pressed={helpNeeded.includes(opt)}
                data-active={helpNeeded.includes(opt) ? "true" : "false"}
                onClick={() => toggle(helpNeeded, setHelpNeeded, opt)}
                className="chip"
              >
                {opt}
              </button>
            ))}
          </div>
        </Field>

        {/* Help offered */}
        <Field label="What help can you offer?">
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Help offered"
          >
            {HELP_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                aria-pressed={helpOffered.includes(opt)}
                data-active={helpOffered.includes(opt) ? "true" : "false"}
                onClick={() => toggle(helpOffered, setHelpOffered, opt)}
                className="chip"
              >
                {opt}
              </button>
            ))}
          </div>
        </Field>

        {/* Divider */}
        <div className="h-px bg-border" role="separator" />

        {/* Optional section */}
        <div className="flex flex-col gap-6">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Optional
          </p>

          <Field label="LinkedIn">
            <input
              id="linkedin"
              name="linkedin_url"
              type="url"
              placeholder="https://linkedin.com/in/..."
              className="form-input"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title">
              <input
                id="title"
                name="title"
                type="text"
                placeholder="Your role"
                className="form-input"
              />
            </Field>
            <Field label="Company">
              <input
                id="company"
                name="company"
                type="text"
                placeholder="Your company"
                className="form-input"
              />
            </Field>
          </div>

          {/* Display consent toggle */}
          <label className="group flex cursor-pointer items-center gap-3">
            <span className="relative inline-flex">
              <input
                name="display_title_company"
                type="checkbox"
                defaultChecked={false}
                className="peer sr-only"
              />
              <span className="h-6 w-11 rounded-full border border-border bg-secondary transition-colors peer-checked:border-primary peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background" />
              <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-foreground shadow-sm transition-transform peer-checked:translate-x-5 peer-checked:bg-primary-foreground" />
            </span>
            <span className="text-sm text-muted-foreground transition-colors group-hover:text-foreground">
              Show title & company in directory
            </span>
          </label>
        </div>

        {/* Error */}
        {status.type === "error" && (
          <div
            role="alert"
            className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {status.message}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <button
            type="submit"
            disabled={status.type === "submitting"}
            className="focus-ring inline-flex h-11 flex-1 items-center justify-center rounded-full bg-primary px-6 text-[13px] font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:brightness-110 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]"
          >
            {status.type === "submitting" ? "Joining\u2026" : "Join Event"}
          </button>
          <Link
            href="/room"
            className="focus-ring inline-flex h-11 items-center justify-center rounded-full border border-border px-6 text-[13px] font-semibold transition-colors hover:bg-secondary active:scale-[0.98]"
          >
            View Directory
          </Link>
        </div>
      </form>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */
function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string
  hint?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline gap-2">
        <label className="text-sm font-medium text-foreground">{label}</label>
        {!required && (
          <span className="text-[11px] text-muted-foreground">optional</span>
        )}
      </div>
      {children}
      {hint && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  )
}
