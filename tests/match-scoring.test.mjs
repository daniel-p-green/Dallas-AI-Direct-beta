import test from 'node:test';
import assert from 'node:assert/strict';

import {
  MATCH_SCORE_WEIGHTS,
  calculateMatchScore,
  rankMatches,
} from '../lib/match-scoring.mjs';

const FIXED_NOW = '2026-02-15T08:00:00.000Z';

const sourceAttendee = {
  id: 'attendee-source',
  ai_comfort_level: 3,
  help_needed: ['fundraising', 'hiring'],
  help_offered: ['go-to-market'],
};

test('scoring is deterministic across repeated ranking runs with the same inputs', () => {
  const candidates = [
    {
      id: 'candidate-b',
      ai_comfort_level: 4,
      help_offered: ['fundraising', 'hiring'],
      display_title_company: true,
      title: 'Founder',
      company: 'North Star AI',
      created_at: '2026-02-14T08:00:00.000Z',
    },
    {
      id: 'candidate-a',
      ai_comfort_level: 2,
      help_offered: ['hiring'],
      display_title_company: false,
      title: 'CTO',
      company: 'Hidden Labs',
      created_at: '2026-01-31T08:00:00.000Z',
    },
  ];

  const firstRun = rankMatches(sourceAttendee, candidates, { now: FIXED_NOW });
  const secondRun = rankMatches(sourceAttendee, candidates, { now: FIXED_NOW });

  assert.deepEqual(firstRun, secondRun);
  assert.deepEqual(
    firstRun.map((match) => match.candidateId),
    ['candidate-b', 'candidate-a'],
  );
});

test('scoring formula combines overlap, comfort proximity, consent visibility, and recency', () => {
  const candidate = {
    id: 'candidate-formula',
    ai_comfort_level: 4,
    help_offered: ['fundraising'],
    display_title_company: true,
    title: 'Head of AI',
    company: 'Signal Ridge',
    created_at: '2026-02-10T08:00:00.000Z',
  };

  const score = calculateMatchScore(sourceAttendee, candidate, { now: FIXED_NOW });

  const expectedOverlap = 0.5; // one of two needed topics is offered
  const expectedComfort = 0.75; // |3-4| distance over max distance (4)
  const expectedConsent = 1;
  const expectedRecency = 0.833333; // 5 days old in a 30 day window
  const expectedTotal = Number(
    (
      expectedOverlap * MATCH_SCORE_WEIGHTS.overlap +
      expectedComfort * MATCH_SCORE_WEIGHTS.comfortProximity +
      expectedConsent * MATCH_SCORE_WEIGHTS.consentVisibility +
      expectedRecency * MATCH_SCORE_WEIGHTS.recency
    ).toFixed(6),
  );

  assert.equal(score.overlapScore, expectedOverlap);
  assert.equal(score.comfortProximityScore, expectedComfort);
  assert.equal(score.consentVisibilityScore, expectedConsent);
  assert.equal(score.recencyScore, expectedRecency);
  assert.equal(score.totalScore, expectedTotal);
});

test('deterministic tie-break uses total score desc, overlap desc, then candidate id asc', () => {
  const candidates = [
    {
      id: 'candidate-z',
      ai_comfort_level: 3,
      help_offered: ['fundraising'],
      display_title_company: false,
      title: 'Operator',
      company: 'Zeta',
      created_at: '2026-02-14T08:00:00.000Z',
    },
    {
      id: 'candidate-a',
      ai_comfort_level: 3,
      help_offered: ['fundraising'],
      display_title_company: false,
      title: 'Operator',
      company: 'Alpha',
      created_at: '2026-02-14T08:00:00.000Z',
    },
  ];

  const ranked = rankMatches(sourceAttendee, candidates, { now: FIXED_NOW });

  assert.equal(ranked[0].totalScore, ranked[1].totalScore);
  assert.equal(ranked[0].overlapScore, ranked[1].overlapScore);
  assert.deepEqual(
    ranked.map((match) => match.candidateId),
    ['candidate-a', 'candidate-z'],
  );
});
