import Link from 'next/link';

export default function LandingPage() {
  return (
    <section className="pageCard stack">
      <h2 className="pageTitle">Replace directory dependency with governed infrastructure</h2>
      <p className="muted">
        Dallas AI Direct Alpha shows a public-safe attendee board pattern with database-boundary
        access control and consent-first profile visibility.
      </p>
      <div className="ctaRow">
        <Link className="button" href="/signup">
          Join via QR
        </Link>
        <Link className="buttonSecondary" href="/room">
          View room board
        </Link>
      </div>
    </section>
  );
}
