import React from 'react';
import {Composition} from 'remotion';
import {DallasAIDirectFlow} from './compositions/DallasAIDirectFlow';

export const RemotionRoot = () => {
  return (
    <Composition
      id="DallasAIDirectFlow"
      component={DallasAIDirectFlow}
      durationInFrames={240}
      fps={30}
      width={1280}
      height={720}
      defaultProps={{
        title: 'Dallas AI Direct',
      }}
    />
  );
};
