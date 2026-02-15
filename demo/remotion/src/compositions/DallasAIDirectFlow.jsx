import React from 'react';
import {AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

const shellStyle = {
  width: 1120,
  minHeight: 560,
  borderRadius: 28,
  padding: '40px 48px',
  background: 'rgba(15, 23, 42, 0.88)',
  border: '1px solid rgba(148, 163, 184, 0.45)',
  boxShadow: '0 30px 70px rgba(2, 6, 23, 0.55)',
};

const titleStyle = {
  fontSize: 54,
  fontWeight: 760,
  letterSpacing: '-0.02em',
  margin: 0,
};

const subtitleStyle = {
  marginTop: 12,
  marginBottom: 24,
  fontSize: 28,
  color: '#cbd5e1',
};

const panelStyle = {
  borderRadius: 20,
  padding: '26px 30px',
  background: 'rgba(2, 6, 23, 0.62)',
  border: '1px solid rgba(148, 163, 184, 0.28)',
};

const bodyStyle = {
  fontSize: 36,
  lineHeight: 1.25,
  margin: 0,
};

const mutedStyle = {
  marginTop: 12,
  fontSize: 24,
  color: '#94a3b8',
};

const Scene = ({heading, body, note, accent = '#38bdf8'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const rise = spring({frame, fps, config: {damping: 200}});

  return (
    <div
      style={{
        ...panelStyle,
        transform: `translateY(${interpolate(rise, [0, 1], [16, 0])}px)`,
        opacity: interpolate(rise, [0, 1], [0, 1]),
      }}
    >
      <div style={{fontSize: 24, fontWeight: 680, color: accent, marginBottom: 14}}>{heading}</div>
      <p style={bodyStyle}>{body}</p>
      <div style={mutedStyle}>{note}</div>
    </div>
  );
};

export const DallasAIDirectFlow = ({title}) => {
  const frame = useCurrentFrame();
  const introOpacity = interpolate(frame, [0, 18], [0, 1], {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill
      style={{
        background: 'radial-gradient(circle at 10% 10%, #1d4ed8 0%, #0f172a 42%, #020617 100%)',
        color: '#f8fafc',
        fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div style={{...shellStyle, opacity: introOpacity}}>
        <h1 style={titleStyle}>{title} • Live Demo Flow</h1>
        <div style={subtitleStyle}>QR signup → Room board update → Privacy-safe public board</div>

        <Sequence from={0} durationInFrames={80}>
          <Scene
            heading="Step 1"
            body="Attendees scan a QR code and complete signup in about 30 seconds."
            note="Only required event fields are collected."
            accent="#60a5fa"
          />
        </Sequence>

        <Sequence from={80} durationInFrames={80}>
          <Scene
            heading="Step 2"
            body="The room board refreshes in ~5 seconds, keeping the organizer view current."
            note="Designed for projector + mobile readability."
            accent="#22d3ee"
          />
        </Sequence>

        <Sequence from={160} durationInFrames={80}>
          <Scene
            heading="Step 3"
            body="Public board stays privacy-safe: no attendee email is ever shown."
            note="Enforced by public-safe projection boundaries in the data layer."
            accent="#34d399"
          />
        </Sequence>
      </div>
    </AbsoluteFill>
  );
};
