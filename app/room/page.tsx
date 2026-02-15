"use client";

import { useEffect, useMemo, useState } from 'react';

type Attendee = {
  name: string;
  title?: string;
  company?: string;
  linkedin_url?: string;
  ai_comfort_level: number;
  help_offered: string[];
  created_at: string;
};

const seed: Attendee[] = [
  {
    name: 'Attendee One',
    title: 'Engineering Lead',
    company: 'Community Co',
    linkedin_url: 'https://linkedin.com',
    ai_comfort_level: 4,
    help_offered: ['Mentoring'],
    created_at: new Date(Date.now() - 10_000).toISOString()
  },
  {
    name: 'Attendee Two',
    linkedin_url: 'https://linkedin.com',
    ai_comfort_level: 3,
    help_offered: ['Hiring'],
    created_at: new Date(Date.now() - 3_000).toISOString()
  }
];

function LinkedinIcon({ size = 15 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function ComfortDots({ level }: { level: number }) {
  return (
    <span className="comfort" aria-label={`Comfort level ${level}`}>
      {[1, 2, 3, 4, 5].map((v) => (
        <span key={v} className={`dot ${v <= level ? 'active' : ''}`} data-level={String(v)} />
      ))}
      <span>{level}</span>
    </span>
  );
}

function getSafeHttpUrl(value: string | undefined) {
  if (!value) {
    return null;
  }

  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.toString() : null;
  } catch {
    return null;
  }
}

export default function RoomPage() {
  const fallbackAttendees = useMemo(
    () => [...seed].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    []
  );
  const [attendees, setAttendees] = useState<Attendee[]>(fallbackAttendees);
  const [dataMode, setDataMode] = useState<'live' | 'fallback'>('live');
  const [loadMessage, setLoadMessage] = useState<string | null>(null);
  const [lastPollAt, setLastPollAt] = useState(Date.now());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadAttendees = async () => {
      try {
        const response = await fetch('/api/attendees/public', {
          cache: 'no-store'
        });

        if (!response.ok) {
          if (isActive) {
            setDataMode('fallback');
            setLoadMessage('Live room data is unavailable. Showing demo seed data.');
            setAttendees(fallbackAttendees);
            setLastPollAt(Date.now());
          }
          return;
        }

        const result = (await response.json()) as { data?: Attendee[] };
        const data = Array.isArray(result.data) ? result.data : [];

        if (isActive) {
          setDataMode('live');
          setLoadMessage(null);
          setAttendees(data);
          setLastPollAt(Date.now());
        }
      } catch {
        if (isActive) {
          setDataMode('fallback');
          setLoadMessage('Live room data is unavailable. Showing demo seed data.');
          setAttendees(fallbackAttendees);
          setLastPollAt(Date.now());
        }
      }
    };

    setMounted(true);
    loadAttendees();
    const timer = setInterval(loadAttendees, 5000);
    return () => {
      isActive = false;
      clearInterval(timer);
    };
  }, [fallbackAttendees]);

  const updatedAgo = Math.max(1, Math.floor((Date.now() - lastPollAt) / 1000));
  const attendeeCount = attendees.length;
  const avgComfort =
    attendeeCount > 0 ? (attendees.reduce((n, a) => n + a.ai_comfort_level, 0) / attendeeCount).toFixed(1) : '0.0';
  const highPct =
    attendeeCount > 0 ? Math.round((attendees.filter((a) => a.ai_comfort_level >= 4).length / attendeeCount) * 100) : 0;

  return (
    <section className="pageCard stack">
      <div className="roomHeader">
        <div>
          <h2 className="pageTitle" style={{ marginBottom: 4 }}>
            Who is in the room?
          </h2>
          <span className="badge">Public view – emails excluded</span>
        </div>
        <span className="updatedAt">Updated {updatedAgo}s ago</span>
      </div>
      <p className="muted" style={{ marginTop: -8 }}>
        Data mode: {dataMode === 'live' ? 'Live attendees_public feed' : 'Fallback demo seed data'}
      </p>
      {loadMessage ? <p className="helper">{loadMessage}</p> : null}

      <div className="metrics">
        <div className="metricCard">
          <p className="metricLabel">Total attendees</p>
          <p className="metricValue">{attendeeCount}</p>
        </div>
        <div className="metricCard">
          <p className="metricLabel">Average comfort</p>
          <p className="metricValue">{avgComfort}</p>
        </div>
        <div className="metricCard">
          <p className="metricLabel">Comfort 4-5</p>
          <p className="metricValue">{highPct}%</p>
        </div>
      </div>

      <div className="attendeeList">
        {attendees.map((a) => {
          const justJoined = mounted && Date.now() - new Date(a.created_at).getTime() <= 5000;
          const safeLinkedinUrl = getSafeHttpUrl(a.linkedin_url);

          return (
            <article key={`${a.name}-${a.created_at}`} className={`attendeeRow ${justJoined ? 'justJoined' : ''}`}>
              <div className="nameBlock">
                <strong>{a.name}</strong>
                <span>{[a.title, a.company].filter(Boolean).join(' · ') || 'Profile private'}</span>
              </div>
              <ComfortDots level={a.ai_comfort_level} />
              <span className="muted">{a.help_offered.join(', ')}</span>
              {safeLinkedinUrl ? (
                <a
                  className="iconButton"
                  href={safeLinkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Open LinkedIn profile"
                >
                  <LinkedinIcon size={15} />
                </a>
              ) : (
                <span className="iconButton" aria-label="LinkedIn profile unavailable">
                  <LinkedinIcon size={15} />
                </span>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
