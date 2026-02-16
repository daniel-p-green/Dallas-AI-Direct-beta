import {Composition} from 'remotion';
import {DallasAIBetaOverview, OVERVIEW_COMPOSITION_DEFAULTS} from './compositions/DallasAIBetaOverview';
import './styles.css';

export const RemotionRoot = () => {
  return (
    <Composition
      id="DallasAIBetaOverview"
      component={DallasAIBetaOverview}
      durationInFrames={OVERVIEW_COMPOSITION_DEFAULTS.durationInFrames}
      fps={OVERVIEW_COMPOSITION_DEFAULTS.fps}
      width={OVERVIEW_COMPOSITION_DEFAULTS.width}
      height={OVERVIEW_COMPOSITION_DEFAULTS.height}
      defaultProps={{
        projectName: 'Dallas AI Direct Beta',
      }}
    />
  );
};
