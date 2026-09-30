// Состояние тренировки: упражнение, повторения, время, цель, пауза, результат.
let s = null;

export const start = (exercise, goal = 0) => {
  s = { exercise, goal, goalHit: false, reps: 0, startedAt: Date.now(), pausedMs: 0, pausedAt: 0, holdMs: 0, goodFrames: 0, totalFrames: 0, errors: {} };
};
export const getReps = () => s.reps;
export const getHoldSeconds = () => Math.floor(s.holdMs / 1000);
export const getElapsedSeconds = () => {
  const now = s.pausedAt || Date.now();
  return Math.max(0, Math.floor((now - s.startedAt - s.pausedMs) / 1000));
};
export const addRep = () => { s.reps++; };
export const addHold = (ms) => { s.holdMs += ms; };
export const addFrame = (isGood) => { s.totalFrames++; if (isGood) s.goodFrames++; };
export const addError = (text) => { s.errors[text] = (s.errors[text] || 0) + 1; };

// Пауза: время паузы не входит в длительность тренировки
export const isPaused = () => !!s?.pausedAt;
export const pause = () => { if (s && !s.pausedAt) s.pausedAt = Date.now(); };
export const resume = () => { if (s?.pausedAt) { s.pausedMs += Date.now() - s.pausedAt; s.pausedAt = 0; } };

// Цель: повторы (или секунды для планки). null — цели нет.
export const goalProgress = () => {
  if (!s || !s.goal) return null;
  const done = s.exercise === 'plank' ? s.holdMs / 1000 : s.reps;
  return Math.min(1, done / s.goal);
};
export const checkGoal = () => {
  if (s.goalHit || goalProgress() !== 1) return false;
  return (s.goalHit = true);
};

export function finish() {
  const top = Object.entries(s.errors).sort((a, b) => b[1] - a[1])[0];
  const result = {
    exercise: s.exercise, reps: s.reps, holdSeconds: getHoldSeconds(), duration: getElapsedSeconds(),
    goal: s.goal, goalReached: s.goalHit,
    topError: top ? top[0] : null,
    technique: s.totalFrames ? Math.round((s.goodFrames / s.totalFrames) * 100) : 0,
  };
  s = null;
  return result;
}
