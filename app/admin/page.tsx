"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';

type MatchStatus = 'suggested' | 'approved' | 'rejected';
type DecisionAction = 'approve' | 'reject';

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
};

type QueueResponse = {
  data?: QueueItem[];
};

function profileHeadline(profile: { title?: string; company?: string }) {
  const text = [profile.title, profile.company].filter(Boolean).join(' · ');
  return text || 'Profile private';
}

function score(value: number) {
  return Number.isFinite(value) ? value.toFixed(3) : '0.000';
}

export default function AdminPage() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<Record<string, true>>({});

  const pendingCount = useMemo(() => items.filter((item) => item.status === 'suggested').length, [items]);

  const loadQueue = useCallback(async () => {
    try {
      const response = await fetch('/api/matches/facilitator-queue?status=suggested&page=1&pageSize=50', {
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error('Facilitator queue unavailable');
      }

      const json = (await response.json()) as QueueResponse;
      setItems(Array.isArray(json.data) ? json.data : []);
      setError(null);
    } catch {
      setError('Could not load facilitator queue. Try again in a few seconds.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadQueue();
  }, [loadQueue]);

  const submitDecision = useCallback(
    async (suggestionId: string, action: DecisionAction) => {
      const previous = items;
      setPendingIds((state) => ({ ...state, [suggestionId]: true }));
      setNotice(null);
      setError(null);

      setItems((state) => state.filter((item) => item.suggestion_id !== suggestionId));

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

        setNotice(action === 'approve' ? 'Suggestion approved.' : 'Suggestion rejected.');
        void loadQueue();
      } catch {
        setItems(previous);
        setError('Decision failed. Queue has been restored.');
      } finally {
        setPendingIds((state) => {
          const next = { ...state };
          delete next[suggestionId];
          return next;
        });
      }
    },
    [items, loadQueue]
  );

  return (
    <section className="pageCard stack">
      <div>
        <h2 className="pageTitle">Facilitator review queue</h2>
        <p className="muted">Review suggested introductions and approve/reject in real time. Email is never shown.</p>
      </div>

      <div className="metrics">
        <div className="metricCard">
          <p className="metricLabel">Pending suggestions</p>
          <p className="metricValue">{pendingCount}</p>
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
    </section>
  );
}
