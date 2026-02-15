import React from 'react';
import {AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

export const STORYBOARD_SCENES = [
  {
    label: 'QR signup',
    heading: 'Step 1 · QR signup',
    body: 'Attendees scan one QR code and finish signup in under 30 seconds.',
    note: 'Fast check-in keeps the room moving.',
    accent: '#60a5fa',
  },
  {
    label: 'Room board update',
    heading: 'Step 2 · Room board update',
    body: 'The facilitator board refreshes quickly so organizers can act on fresh intent.',
    note: 'Readable on projector + phone without zooming.',
    accent: '#22d3ee',
  },
  {
    label: 'Privacy-safe public view',
    heading: 'Step 3 · Privacy-safe public view',
    body: 'Public board shows names and context only — attendee email is never shown publicly.',
    note: 'Privacy boundary: no public email exposure.',
    accent: '#34d399',
  },
];

const shellStyle = {
  width: 860,
  minHeight: 420,
  borderRadius: 24,
  padding: '28px 34px',
  background: 'rgba(15, 23, 42, 0.9)',
  border: '1px solid rgba(148, 163, 184, 0.42)',
  boxShadow: '0 18px 42px rgba(2, 6, 23, 0.5)',
};

const titleStyle = {
  fontSize: 40,
  fontWeight: 760,
  letterSpacing: '-0.02em',
  margin: 0,
};

const subtitleStyle = {
  marginTop: 10,
  marginBottom: 18,
  fontSize: 22,
  color: '#cbd5e1',
};

const panelStyle = {
  borderRadius: 16,
  padding: '20px 24px',
  background: 'rgba(2, 6, 23, 0.68)',
  border: '1px solid rgba(148, 163, 184, 0.25)',
};

const bodyStyle = {
  fontSize: 30,
  lineHeight: 1.24,
  margin: 0,
};

const mutedStyle = {
  marginTop: 10,
  fontSize: 20,
  color: '#94a3b8',
};

const Scene = ({heading, body, note, accent}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const rise = spring({frame, fps, config: {damping: 180}});

  return (
    <div
      style={{
        ...panelStyle,
        transform: `translateY(${interpolate(rise, [0, 1], [12, 0])}px)`,
        opacity: interpolate(rise, [0, 1], [0, 1]),
      }}
    >
      <div style={{fontSize: 21, fontWeight: 680, color: accent, marginBottom: 10}}>{heading}</div>
      <p style={bodyStyle}>{body}</p>
      <div style={mutedStyle}>{note}</div>
    </div>
  );
};

export const DallasAIDirectFlow = ({title}) => {
  const frame = useCurrentFrame();
  const introOpacity = interpolate(frame, [0, 12], [0, 1], {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill
      style={{
        background: 'radial-gradient(circle at 12% 8%, #1d4ed8 0%, #0f172a 45%, #020617 100%)',
        color: '#f8fafc',
        fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 26,
      }}
    >
      <div style={{...shellStyle, opacity: introOpacity}}>
        <h1 style={titleStyle}>{title} · Live demo flow</h1>
        <div style={subtitleStyle}>{STORYBOARD_SCENES.map((scene) => scene.label).join(' → ')}</div>

        {STORYBOARD_SCENES.map((scene, index) => (
          <Sequence key={scene.label} from={index * 72} durationInFrames={72}>
            <Scene heading={scene.heading} body={scene.body} note={scene.note} accent={scene.accent} />
          </Sequence>
        ))}
      </div>
    </AbsoluteFill>
  );
};
