import React from 'react';
import {AbsoluteFill, Sequence, interpolate, useCurrentFrame} from 'remotion';

const cardStyle = {
  padding: '28px 36px',
  borderRadius: 20,
  backgroundColor: 'rgba(16, 16, 16, 0.85)',
  border: '1px solid rgba(255,255,255,0.18)',
  maxWidth: 980,
};

const lineStyle = {
  marginTop: 10,
  fontSize: 34,
  lineHeight: 1.3,
};

export const DallasAIDirectFlow = ({title}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #111827 60%, #020617 100%)',
        color: '#fff',
        fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div style={{...cardStyle, opacity}}>
        <div style={{fontSize: 44, fontWeight: 700}}>{title} Demo Flow</div>

        <Sequence from={0} durationInFrames={95}>
          <div style={lineStyle}>1) QR signup in ~30 seconds</div>
        </Sequence>

        <Sequence from={95} durationInFrames={95}>
          <div style={lineStyle}>2) Room board updates within 5 seconds</div>
        </Sequence>

        <Sequence from={190} durationInFrames={110}>
          <div style={lineStyle}>3) Public view is privacy-safe: no email exposure</div>
        </Sequence>
      </div>
    </AbsoluteFill>
  );
};
