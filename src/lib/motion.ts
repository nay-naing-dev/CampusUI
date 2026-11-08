/** Progress from 0 to 1 while `time` moves between `start` and `end`. */
export function segment(time: number, start: number, end: number) {
  'worklet';
  return Math.min(1, Math.max(0, (time - start) / (end - start)));
}

export function easeOut(progress: number) {
  'worklet';
  return 1 - (1 - progress) ** 3;
}

/** Runs slightly past 1 before settling, for things that pop into place. */
export function overshoot(progress: number) {
  'worklet';
  const pull = 1.9;
  const rest = progress - 1;
  return 1 + (pull + 1) * rest ** 3 + pull * rest ** 2;
}
