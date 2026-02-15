const MAX_COMFORT_DISTANCE = 4;
const DEFAULT_RECENCY_WINDOW_DAYS = 30;

export const MATCH_SCORE_WEIGHTS = Object.freeze({
  overlap: 0.5,
  comfortProximity: 0.2,
  consentVisibility: 0.1,
  recency: 0.2,
});

export const MATCH_SCORING_VERSION = 'invite-match-v1';

function roundScore(value: number) {
  return Number(value.toFixed(6));
}

function toTimestamp(value: unknown) {
  if (!value) {
    return null;
  }

  const timestamp = new Date(String(value)).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}

function normalizeTopics(values: unknown) {
  if (!Array.isArray(values)) {
    return [] as string[];
  }

  const unique = new Set<string>();

  for (const value of values) {
    if (typeof value !== 'string') {
      continue;
    }

    const normalized = value.trim().toLowerCase();
    if (normalized) {
      unique.add(normalized);
    }
  }

  return [...unique].sort();
}

function calculateOverlapScore(helpNeeded: unknown, helpOffered: unknown) {
  const needed = normalizeTopics(helpNeeded);
  const offered = new Set(normalizeTopics(helpOffered));

  if (needed.length === 0) {
    return 0;
  }

  let matched = 0;
  for (const need of needed) {
    if (offered.has(need)) {
      matched += 1;
    }
  }

  return roundScore(matched / needed.length);
}

function calculateComfortProximityScore(sourceComfort: unknown, candidateComfort: unknown) {
  if (!Number.isFinite(sourceComfort) || !Number.isFinite(candidateComfort)) {
    return 0;
  }

  const distance = Math.min(MAX_COMFORT_DISTANCE, Math.abs(Number(sourceComfort) - Number(candidateComfort)));
  return roundScore(1 - distance / MAX_COMFORT_DISTANCE);
}

function calculateConsentVisibilityScore(candidate: Record<string, unknown>) {
  if (candidate.display_title_company !== true) {
    return 0;
  }

  const hasTitleOrCompany = Boolean(
    (typeof candidate.title === 'string' ? candidate.title : '').trim() ||
      (typeof candidate.company === 'string' ? candidate.company : '').trim(),
  );
  return hasTitleOrCompany ? 1 : 0;
}

function calculateRecencyScore(candidateCreatedAt: unknown, now: unknown, recencyWindowDays = DEFAULT_RECENCY_WINDOW_DAYS) {
  const candidateTimestamp = toTimestamp(candidateCreatedAt);
  const nowTimestamp = toTimestamp(now);

  if (!candidateTimestamp || !nowTimestamp || recencyWindowDays <= 0) {
    return 0;
  }

  const elapsedMs = Math.max(0, nowTimestamp - candidateTimestamp);
  const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24);
  const raw = 1 - elapsedDays / recencyWindowDays;
  return roundScore(Math.max(0, Math.min(1, raw)));
}

function calculateMatchScore(sourceAttendee: Record<string, unknown>, candidateAttendee: Record<string, unknown>, now: string) {
  const overlapScore = calculateOverlapScore(sourceAttendee.help_needed, candidateAttendee.help_offered);
  const comfortProximityScore = calculateComfortProximityScore(
    sourceAttendee.ai_comfort_level,
    candidateAttendee.ai_comfort_level,
  );
  const consentVisibilityScore = calculateConsentVisibilityScore(candidateAttendee);
  const recencyScore = calculateRecencyScore(candidateAttendee.created_at, now);

  const totalScore = roundScore(
    overlapScore * MATCH_SCORE_WEIGHTS.overlap +
      comfortProximityScore * MATCH_SCORE_WEIGHTS.comfortProximity +
      consentVisibilityScore * MATCH_SCORE_WEIGHTS.consentVisibility +
      recencyScore * MATCH_SCORE_WEIGHTS.recency,
  );

  return {
    overlapScore,
    comfortProximityScore,
    consentVisibilityScore,
    recencyScore,
    totalScore,
  };
}

export function rankMatches(
  sourceAttendee: Record<string, unknown> & { id: string },
  candidates: Array<Record<string, unknown> & { id: string }>,
  options: { now: string },
) {
  return candidates
    .filter((candidate) => candidate?.id && candidate.id !== sourceAttendee.id)
    .map((candidate) => {
      const score = calculateMatchScore(sourceAttendee, candidate, options.now);
      return {
        candidateId: candidate.id,
        candidate,
        ...score,
      };
    })
    .sort((a, b) => {
      if (b.totalScore !== a.totalScore) {
        return b.totalScore - a.totalScore;
      }

      if (b.overlapScore !== a.overlapScore) {
        return b.overlapScore - a.overlapScore;
      }

      return a.candidateId.localeCompare(b.candidateId);
    });
}
