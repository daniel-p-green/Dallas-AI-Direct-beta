import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative flex flex-col items-center overflow-hidden px-5 pb-24 pt-28 text-center md:pb-32 md:pt-40">
      {/* Ambient glow -- purely decorative */}
      <div
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 h-[600px] opacity-40"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, hsl(217 91% 60% / 0.15), transparent)",
        }}
        aria-hidden="true"
      />

      <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
        Dallas AI Direct
      </p>

      <h1 className="mt-5 max-w-[720px] text-balance text-[clamp(2.25rem,6vw,4rem)] font-bold leading-[1.1] tracking-tight">
        Connecting 10,000+ minds building the future of AI in Dallas.
      </h1>

      <p className="mt-5 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground md:text-lg md:leading-relaxed">
        The live directory for Dallas AI events. Share what you are working on, find the right people, and turn every meetup into your next opportunity.
      </p>

      <div className="mt-10 flex w-full max-w-xs flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
        <Link
          href="/signup"
          className="focus-ring inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-[13px] font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:brightness-110 active:scale-[0.98]"
        >
          Join the Event
        </Link>
        <Link
          href="/room"
          className="focus-ring inline-flex h-11 items-center justify-center rounded-full border border-border px-6 text-[13px] font-semibold transition-colors hover:bg-secondary active:scale-[0.98]"
        >
          Browse the Room
        </Link>
      </div>

      {/* Value propositions */}
      <dl className="mt-16 grid w-full max-w-lg grid-cols-3 gap-px overflow-hidden rounded-2xl border border-border bg-border">
        {[
          { term: "10,000+", def: "Community members" },
          { term: "Privacy-first", def: "Email never shared" },
          { term: "Live signals", def: "Hiring, learning, building" },
        ].map((item) => (
          <div
            key={item.term}
            className="flex flex-col items-center gap-1 bg-card px-2 py-4 sm:px-3"
          >
            <dt className="text-[11px] font-semibold sm:text-xs">{item.term}</dt>
            <dd className="text-center text-[10px] text-muted-foreground sm:text-[11px]">{item.def}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
