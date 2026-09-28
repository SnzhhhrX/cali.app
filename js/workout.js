// Состояние тренировки: упражнение, повторения, время, результат.
let s = null;

export const start = (exercise) => {
  s = { exercise, reps: 0, startedAt: Date.now(), holdMs: 0, goodFrames: 0, totalFrames: 0, errors: {} };
};
export const getReps = () => s.reps;
export const getHoldSeconds = () => Math.floor(s.holdMs / 1000);
export const getElapsedSeconds = () => Math.floor((Date.now() - s.startedAt) / 1000);
export const addRep = () => { s.reps++; };
export const addHold = (ms) => { s.holdMs += ms; };
export const addFrame = (isGood) => { s.totalFrames++; if (isGood) s.goodFrames++; };

export const addError = (text) => { s.errors[text] = (s.errors[text] || 0) + 1; };

export function finish() {
  const top = Object.entries(s.errors).sort((a, b) => b[1] - a[1])[0];
  const result = {
    exercise: s.exercise, reps: s.reps, holdSeconds: getHoldSeconds(), duration: getElapsedSeconds(),
    topError: top ? top[0] : null,
    technique: s.totalFrames ? Math.round((s.goodFrames / s.totalFrames) * 100) : 0,
  };
  s = null;
  return result;
}
