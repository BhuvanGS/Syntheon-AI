import { Composition as RemotionComposition } from 'remotion';
import { Composition as SyntheonFilm } from '../remotion/Composition';
import { FPS, VIDEO_WIDTH, VIDEO_HEIGHT, TOTAL_DURATION } from '../remotion/constants';

export const RemotionRoot: React.FC = () => {
  return (
    <RemotionComposition
      id="SyntheonFilm"
      component={SyntheonFilm}
      durationInFrames={TOTAL_DURATION}
      fps={FPS}
      width={VIDEO_WIDTH}
      height={VIDEO_HEIGHT}
    />
  );
};
