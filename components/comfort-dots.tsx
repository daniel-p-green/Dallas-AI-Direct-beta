export function ComfortDots({ level }: { level: number }) {
  return (
    <span
      className="inline-flex w-[72px] items-center gap-[3px]"
      role="img"
      aria-label={`AI comfort level ${level} of 5`}
    >
      {[1, 2, 3, 4, 5].map((v) => (
        <span
          key={v}
          className={`comfort-segment ${
            v <= level ? "bg-primary" : "bg-border"
          }`}
        />
      ))}
    </span>
  )
}
