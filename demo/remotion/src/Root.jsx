import React from 'react';
import {Composition} from 'remotion';
import {DallasAIDirectFlow} from './compositions/DallasAIDirectFlow';

export const DALLAS_DEMO_COMPOSITION_DEFAULTS = {
  durationInFrames: 216,
  fps: 24,
  width: 960,
  height: 540,
};

export const RemotionRoot = () => {
  return (
    <Composition
      id="DallasAIDirectFlow"
      component={DallasAIDirectFlow}
      durationInFrames={DALLAS_DEMO_COMPOSITION_DEFAULTS.durationInFrames}
      fps={DALLAS_DEMO_COMPOSITION_DEFAULTS.fps}
      width={DALLAS_DEMO_COMPOSITION_DEFAULTS.width}
      height={DALLAS_DEMO_COMPOSITION_DEFAULTS.height}
      defaultProps={{
        title: 'Dallas AI Direct',
      }}
    />
  );
};
