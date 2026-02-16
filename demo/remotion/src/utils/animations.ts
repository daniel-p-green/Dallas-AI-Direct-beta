import {interpolate, spring} from 'remotion';

const smoothSpring = {damping: 200};
const snappySpring = {damping: 20, stiffness: 200};

export function fadeIn(frame: number, fps: number, delaySeconds = 0, durationSeconds = 0.4) {
  const delayFrames = delaySeconds * fps;
  const durationFrames = durationSeconds * fps;
  return interpolate(frame, [delayFrames, delayFrames + durationFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });
}

export function slideUp(frame: number, fps: number, delaySeconds = 0, distance = 30) {
  const progress = spring({
    frame: frame - delaySeconds * fps,
    fps,
    config: smoothSpring
  });
  return interpolate(progress, [0, 1], [distance, 0]);
}

export function slideRight(frame: number, fps: number, delaySeconds = 0, distance = 24) {
  const progress = spring({
    frame: frame - delaySeconds * fps,
    fps,
    config: smoothSpring
  });
  return interpolate(progress, [0, 1], [-distance, 0]);
}

export function scaleIn(frame: number, fps: number, delaySeconds = 0, from = 0.9) {
  const progress = spring({
    frame: frame - delaySeconds * fps,
    fps,
    config: snappySpring
  });
  return interpolate(progress, [0, 1], [from, 1]);
}
