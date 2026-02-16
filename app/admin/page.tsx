"use client";

import { useRouter } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';

type MatchStatus = 'suggested' | 'approved' | 'rejected';
type IntroOutcome = 'pending' | 'delivered' | 'not_delivered';
type DecisionAction = 'approve' | 'reject' | 'delivered' | 'not_delivered';

type QueueItem = {
  suggestion_id: string;
  run_id: string;
  status: MatchStatus;
  rank_position: number;
  created_at: string;
  attendee: {
    id: string;
    name: string;
    title?: string;
    company?: string;
    ai_comfort_level: number;
    help_needed: string[];
    help_offered: string[];
  };
  matched_attendee: {
    id: string;
    name: string;
    title?: string;
    company?: string;
    ai_comfort_level: number;
    help_needed: string[];
    help_offered: string[];
  };
  score_breakdown: {
    total_score: number;
    overlap_score: number;
    ai_comfort_proximity_score: number;
    recency_score: number;
    consent_visibility_score: number;
  };
  intro_outcome: IntroOutcome;
  intro_outcome_at: string | null;
  intro_outcome_by: string | null;
};

type EventSession = {
  id: string;
  slug: string;
  name: string;
  starts_at: string | null;
  ends_at: string | null;
  check_in_window_start: string | null;
  check_in_window_end: string | null;
  is_active: boolean;
};

type QueueResponse = {
  data?: QueueItem[];
};

type EventResponse = {
  active?: EventSession | null;
  events?: EventSession[];
};

type CreateEventFormState = {
  slug: string;
  name: string;
  startsAt: string;
  endsAt: string;
  checkInStart: string;
  checkInEnd: string;
};

const EMPTY_EVENT_FORM: CreateEventFormState = {
  slug: '',
  name: '',
  startsAt: '',
  endsAt: '',
  checkInStart: '',
  checkInEnd: '',
};

function profileHeadline(profile: { title?: string; company?: string }) {
  const text = [profile.title, profile.company].filter(Boolean).join(' · ');
  return text || 'Profile private';
}

function score(value: number) {
  return Number.isFinite(value) ? value.toFixed(3) : '0.000';
}

function isInvalidWindowRange(form: CreateEventFormState) {
  if (form.checkInStart && form.checkInEnd) {
    return Date.parse(form.checkInStart) > Date.parse(form.checkInEnd);
  }

  return false;
}

export default function AdminPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [items, setItems] = useState<QueueItem[]>([]);
  const [approvedItems, setApprovedItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<Record<string, true>>({});

  const [events, setEvents] = useState<EventSession[]>([]);
  const [activeEvent, setActiveEvent] = useState<EventSession | null>(null);
  const [eventLoading, setEventLoading] = useState(true);
  const [eventBusyId, setEventBusyId] = useState<string | null>(null);
  const [eventError, setEventError] = useState<string | null>(null);
  const [eventNotice, setEventNotice] = useState<string | null>(null);
  const [eventForm, setEventForm] = useState<CreateEventFormState>(EMPTY_EVENT_FORM);

  const pendingCount = useMemo(() => items.filter((item) => item.status === 'suggested').length, [items]);
  const approvedCount = useMemo(() => approvedItems.length, [approvedItems]);
  const deliveredCount = useMemo(
    () => approvedItems.filter((item) => item.intro_outcome === 'delivered').length,
    [approvedItems]
  );
  const introConversionPct = useMemo(() => {
    if (approvedCount === 0) {
      return 0;
    }

    return Math.round((deliveredCount / approvedCount) * 100);
  }, [approvedCount, deliveredCount]);

  useEffect(() => {
    let active = true;

    async function checkSession() {
      try {
        const response = await fetch('/api/auth/session', { cache: 'no-store' });
        const json = (await response.json().catch(() => ({}))) as { user?: { role?: string } | null };

        if (!active) {
          return;
        }

        if (json.user?.role === 'admin') {
          setAuthorized(true);
          return;
        }

        router.replace('/login?next=/admin');
      } catch {
        if (active) {
          router.replace('/login?next=/admin');
        }
      } finally {
        if (active) {
          setAuthChecked(true);
        }
      }
    }

    void checkSession();

    return () => {
      active = false;
    };
  }, [router]);

  const loadQueue = useCallback(async () => {
    try {
      const [suggestedResponse, approvedResponse] = await Promise.all([
        fetch('/api/matches/facilitator-queue?status=suggested&page=1&pageSize=50', {
          cache: 'no-store',
        }),
        fetch('/api/matches/facilitator-queue?status=approved&page=1&pageSize=50', {
          cache: 'no-store',
        }),
      ]);

      if (!suggestedResponse.ok || !approvedResponse.ok) {
        throw new Error('Facilitator queue unavailable');
      }

      const [suggestedJson, approvedJson] = (await Promise.all([
        suggestedResponse.json(),
        approvedResponse.json(),
      ])) as [QueueResponse, QueueResponse];

      setItems(Array.isArray(suggestedJson.data) ? suggestedJson.data : []);
      setApprovedItems(Array.isArray(approvedJson.data) ? approvedJson.data : []);
      setError(null);
    } catch {
      setError('Could not load facilitator queue. Try again in a few seconds.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadEvents = useCallback(async () => {
    try {
      const response = await fetch('/api/events', {
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error('Event sessions unavailable');
      }

      const json = (await response.json()) as EventResponse;
      setEvents(Array.isArray(json.events) ? json.events : []);
      setActiveEvent(json.active ?? null);
      setEventError(null);
    } catch {
      setEventError('Could not load event sessions. Try again in a few seconds.');
    } finally {
      setEventLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authorized) {
      return;
    }

    void loadQueue();
    void loadEvents();
  }, [authorized, loadQueue, loadEvents]);

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      router.replace('/login');
    }
  }, [router]);

  const submitDecision = useCallback(
    async (suggestionId: string, action: DecisionAction) => {
      const previous = items;
      const previousApproved = approvedItems;
      setPendingIds((state) => ({ ...state, [suggestionId]: true }));
      setNotice(null);
      setError(null);

      setItems((state) => state.filter((item) => item.suggestion_id !== suggestionId));
      if (action === 'delivered' || action === 'not_delivered') {
        setApprovedItems((state) =>
          state.map((item) =>
            item.suggestion_id === suggestionId
              ? {
                  ...item,
                  intro_outcome: action,
                }
              : item
          )
        );
      }

      try {
        const response = await fetch(`/api/matches/${suggestionId}/decision`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action,
            actor: 'facilitator-ui'
          })
        });

        if (!response.ok) {
          throw new Error('Decision request failed');
        }

        if (action === 'approve') {
          setNotice('Suggestion approved.');
        } else if (action === 'reject') {
          setNotice('Suggestion rejected.');
        } else {
          setNotice(action === 'delivered' ? 'Intro marked delivered.' : 'Intro marked not delivered.');
        }
        void loadQueue();
      } catch {
        setItems(previous);
        setApprovedItems(previousApproved);
        setError('Decision failed. Queue has been restored.');
      } finally {
        setPendingIds((state) => {
          const next = { ...state };
          delete next[suggestionId];
          return next;
        });
      }
    },
    [approvedItems, items, loadQueue]
  );

  const createEventSession = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEventError(null);
    setEventNotice(null);

    if (!eventForm.slug.trim() || !eventForm.name.trim()) {
      setEventError('Slug and event name are required.');
      return;
    }

    if (isInvalidWindowRange(eventForm)) {
      setEventError('Check-in window start must be before check-in window end.');
      return;
    }

    setEventBusyId('create');

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'create',
          slug: eventForm.slug.trim(),
          name: eventForm.name.trim(),
          starts_at: eventForm.startsAt || null,
          ends_at: eventForm.endsAt || null,
          check_in_window_start: eventForm.checkInStart || null,
          check_in_window_end: eventForm.checkInEnd || null,
          is_active: true,
        })
      });

      const json = (await response.json()) as { error?: string };

      if (!response.ok) {
        setEventError(json.error ?? 'Unable to create event session.');
        return;
      }

      setEventForm(EMPTY_EVENT_FORM);
      setEventNotice('Event session created and set active.');
      await loadEvents();
    } catch {
      setEventError('Unable to create event session.');
    } finally {
      setEventBusyId(null);
    }
  }, [eventForm, loadEvents]);

  const activateEventSession = useCallback(async (session: EventSession) => {
    if (activeEvent?.id === session.id) {
      return;
    }

    const shouldSwitch = window.confirm(`Set "${session.name}" as the active event session?`);
    if (!shouldSwitch) {
      return;
    }

    setEventError(null);
    setEventNotice(null);
    setEventBusyId(session.id);

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'activate',
          event_id: session.id,
        })
      });

      const json = (await response.json()) as { error?: string };

      if (!response.ok) {
        setEventError(json.error ?? 'Unable to activate event session.');
        return;
      }

      setEventNotice(`Active session switched to ${session.name}.`);
      await loadEvents();
    } catch {
      setEventError('Unable to activate event session.');
    } finally {
      setEventBusyId(null);
    }
  }, [activeEvent?.id, loadEvents]);

  if (!authChecked) {
    return (
      <section className="pageCard stack">
        <p className="muted">Checking admin session…</p>
      </section>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <section className="pageCard stack">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="pageTitle">Organizer admin console</h2>
          <p className="muted">Manage event sessions and review suggested introductions. Email is never shown.</p>
        </div>
        <button type="button" className="buttonSecondary" onClick={() => void handleLogout()}>
          Sign out
        </button>
      </div>

      <article className="adminSection stack">
        <div className="adminSectionHeader">
          <h3>Event sessions</h3>
          <span className="badge">
            Active: {activeEvent ? activeEvent.name : 'No active session'}
          </span>
        </div>

        {eventError ? <p className="adminError">{eventError}</p> : null}
        {eventNotice ? <p className="adminSuccess">{eventNotice}</p> : null}

        <form className="stack" onSubmit={createEventSession}>
          <div className="gridTwo">
            <label className="field">
              <span>Event slug</span>
              <input
                type="text"
                name="slug"
                value={eventForm.slug}
                onChange={(event) => setEventForm((state) => ({ ...state, slug: event.target.value }))}
                placeholder="spring-2026-dallas"
                required
              />
            </label>
            <label className="field">
              <span>Event name</span>
              <input
                type="text"
                name="name"
                value={eventForm.name}
                onChange={(event) => setEventForm((state) => ({ ...state, name: event.target.value }))}
                placeholder="Dallas AI Direct — Spring 2026"
                required
              />
            </label>
          </div>

          <div className="gridTwo">
            <label className="field">
              <span>Session starts (optional)</span>
              <input
                type="datetime-local"
                name="startsAt"
                value={eventForm.startsAt}
                onChange={(event) => setEventForm((state) => ({ ...state, startsAt: event.target.value }))}
              />
            </label>
            <label className="field">
              <span>Session ends (optional)</span>
              <input
                type="datetime-local"
                name="endsAt"
                value={eventForm.endsAt}
                onChange={(event) => setEventForm((state) => ({ ...state, endsAt: event.target.value }))}
              />
            </label>
          </div>

          <div className="gridTwo">
            <label className="field">
              <span>Check-in window start (optional)</span>
              <input
                type="datetime-local"
                name="checkInStart"
                value={eventForm.checkInStart}
                onChange={(event) => setEventForm((state) => ({ ...state, checkInStart: event.target.value }))}
              />
            </label>
            <label className="field">
              <span>Check-in window end (optional)</span>
              <input
                type="datetime-local"
                name="checkInEnd"
                value={eventForm.checkInEnd}
                onChange={(event) => setEventForm((state) => ({ ...state, checkInEnd: event.target.value }))}
              />
            </label>
          </div>

          <div className="ctaRow">
            <button className="button" type="submit" disabled={eventBusyId === 'create'}>
              {eventBusyId === 'create' ? 'Creating…' : 'Create and activate session'}
            </button>
          </div>
        </form>

        {eventLoading ? <p className="muted">Loading event sessions…</p> : null}
        {!eventLoading && events.length === 0 ? <p className="muted">No event sessions found.</p> : null}

        <div className="adminEventList">
          {events.map((session) => {
            const isActive = activeEvent?.id === session.id;
            const isBusy = eventBusyId === session.id;

            return (
              <article key={session.id} className="adminEventCard">
                <header className="adminSuggestionHeader">
                  <strong>{session.name}</strong>
                  <span className="badge">{isActive ? 'Active' : session.slug}</span>
                </header>
                <p className="muted">Check-in: {session.check_in_window_start ?? 'Open'} → {session.check_in_window_end ?? 'Open'}</p>
                <div className="ctaRow">
                  <button
                    type="button"
                    className="buttonSecondary"
                    disabled={isActive || isBusy}
                    onClick={() => void activateEventSession(session)}
                  >
                    {isBusy ? 'Switching…' : isActive ? 'Current active session' : 'Set active session'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </article>

      <article className="adminSection stack">
        <div>
          <h3>Facilitator review queue</h3>
          <p className="muted">Approve/reject suggested introductions in real time.</p>
        </div>

        <div className="metrics">
          <div className="metricCard">
            <p className="metricLabel">Pending suggestions</p>
            <p className="metricValue">{pendingCount}</p>
          </div>
          <div className="metricCard">
            <p className="metricLabel">Approved intros</p>
            <p className="metricValue">{approvedCount}</p>
          </div>
          <div className="metricCard">
            <p className="metricLabel">Intro conversion</p>
            <p className="metricValue">
              {introConversionPct}% <span className="muted">({deliveredCount}/{approvedCount || 0})</span>
            </p>
          </div>
        </div>

        {loading ? <p className="muted">Loading facilitator queue…</p> : null}
        {error ? <p className="adminError">{error}</p> : null}
        {notice ? <p className="adminSuccess">{notice}</p> : null}

        {!loading && items.length === 0 ? (
          <p className="muted">No pending suggestions right now.</p>
        ) : (
          <div className="adminQueue">
            {items.map((item) => {
              const isPending = pendingIds[item.suggestion_id] === true;

              return (
                <article key={item.suggestion_id} className="adminSuggestionCard">
                  <header className="adminSuggestionHeader">
                    <strong>Rank #{item.rank_position}</strong>
                    <span className="badge">Score {score(item.score_breakdown.total_score)}</span>
                  </header>

                  <div className="adminPairingGrid">
                    <div>
                      <p className="metricLabel">Attendee</p>
                      <p>
                        <strong>{item.attendee.name}</strong>
                      </p>
                      <p className="muted">{profileHeadline(item.attendee)}</p>
                    </div>
                    <div>
                      <p className="metricLabel">Suggested intro</p>
                      <p>
                        <strong>{item.matched_attendee.name}</strong>
                      </p>
                      <p className="muted">{profileHeadline(item.matched_attendee)}</p>
                    </div>
                  </div>

                  <dl className="adminScoreGrid">
                    <div>
                      <dt>Overlap</dt>
                      <dd>{score(item.score_breakdown.overlap_score)}</dd>
                    </div>
                    <div>
                      <dt>AI comfort</dt>
                      <dd>{score(item.score_breakdown.ai_comfort_proximity_score)}</dd>
                    </div>
                    <div>
                      <dt>Consent visibility</dt>
                      <dd>{score(item.score_breakdown.consent_visibility_score)}</dd>
                    </div>
                    <div>
                      <dt>Recency</dt>
                      <dd>{score(item.score_breakdown.recency_score)}</dd>
                    </div>
                  </dl>

                  <div className="ctaRow">
                    <button
                      type="button"
                      className="button"
                      onClick={() => void submitDecision(item.suggestion_id, 'approve')}
                      disabled={isPending}
                    >
                      {isPending ? 'Saving…' : 'Approve'}
                    </button>
                    <button
                      type="button"
                      className="buttonSecondary"
                      onClick={() => void submitDecision(item.suggestion_id, 'reject')}
                      disabled={isPending}
                    >
                      Reject
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="stack">
          <h4>You should meet outcomes</h4>
          {approvedItems.length === 0 ? (
            <p className="muted">No approved introductions yet.</p>
          ) : (
            <div className="adminQueue">
              {approvedItems.map((item) => {
                const isPending = pendingIds[item.suggestion_id] === true;

                return (
                  <article key={`outcome-${item.suggestion_id}`} className="adminSuggestionCard">
                    <header className="adminSuggestionHeader">
                      <strong>
                        {item.attendee.name} → {item.matched_attendee.name}
                      </strong>
                      <span className="badge">
                        {item.intro_outcome === 'pending'
                          ? 'Outcome pending'
                          : item.intro_outcome === 'delivered'
                            ? 'Delivered'
                            : 'Not delivered'}
                      </span>
                    </header>
                    <p className="muted">Approved intro outcome tracking for post-event quality.</p>
                    <div className="ctaRow">
                      <button
                        type="button"
                        className="button"
                        disabled={isPending || item.intro_outcome === 'delivered'}
                        onClick={() => void submitDecision(item.suggestion_id, 'delivered')}
                      >
                        {isPending ? 'Saving…' : 'Mark delivered'}
                      </button>
                      <button
                        type="button"
                        className="buttonSecondary"
                        disabled={isPending || item.intro_outcome === 'not_delivered'}
                        onClick={() => void submitDecision(item.suggestion_id, 'not_delivered')}
                      >
                        Mark not delivered
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </article>
    </section>
  );
}
