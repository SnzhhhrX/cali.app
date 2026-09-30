// Статистика и достижения — считаются из истории (localStorage), без backend.
const midnight = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
const score = (r) => (r.exercise === 'plank' ? r.holdSeconds : r.reps) || 0;

export function calcStats(list) {
  const stamps = [...new Set(list.map((r) => midnight(new Date(r.date))))].sort((a, b) => a - b);
  let bestStreak = 0, run = 0;
  stamps.forEach((s, i) => {
    run = i && Math.round((s - stamps[i - 1]) / 864e5) === 1 ? run + 1 : 1;
    bestStreak = Math.max(bestStreak, run);
  });
  const set = new Set(stamps);
  let streak = 0, t = midnight(new Date());
  if (!set.has(t)) { const y = new Date(t); y.setDate(y.getDate() - 1); t = midnight(y); }
  while (set.has(t)) { streak++; const p = new Date(t); p.setDate(p.getDate() - 1); t = midnight(p); }

  const ex = {};
  for (const name of ['squat', 'pushup', 'plank']) {
    const rows = list.filter((r) => r.exercise === name);
    ex[name] = { count: rows.length, best: Math.max(0, ...rows.map(score)) };
  }
  const techs = list.map((r) => r.technique || 0);
  return {
    workouts: list.length,
    reps: list.reduce((n, r) => n + (r.reps || 0), 0),
    seconds: list.reduce((n, r) => n + (r.duration || 0), 0),
    avgTech: techs.length ? Math.round(techs.reduce((a, b) => a + b, 0) / techs.length) : 0,
    bestTech: Math.max(0, ...techs),
    streak, bestStreak, ex,
    plankBest: ex.plank.best,
    exCount: Object.values(ex).filter((e) => e.count).length,
    goalHits: list.filter((r) => r.goalReached).length,
    clean: list.some((r) => r.technique >= 90 && (r.reps >= 5 || r.holdSeconds >= 20)),
  };
}

// p — прогресс [текущее, цель] для ещё не открытых достижений
export const BADGES = [
  { id: 'first', ok: (s) => s.workouts >= 1 },
  { id: 'reps50', ok: (s) => s.reps >= 50, p: (s) => [s.reps, 50] },
  { id: 'reps200', ok: (s) => s.reps >= 200, p: (s) => [s.reps, 200] },
  { id: 'clean', ok: (s) => s.clean },
  { id: 'streak3', ok: (s) => s.bestStreak >= 3, p: (s) => [s.bestStreak, 3] },
  { id: 'plank60', ok: (s) => s.plankBest >= 60, p: (s) => [s.plankBest, 60] },
  { id: 'allthree', ok: (s) => s.exCount >= 3, p: (s) => [s.exCount, 3] },
  { id: 'goal', ok: (s) => s.goalHits >= 1 },
];

export const unlockedIds = (list) => { const s = calcStats(list); return BADGES.filter((b) => b.ok(s)).map((b) => b.id); };
export const bestOf = (list, exercise) => Math.max(0, ...list.filter((r) => r.exercise === exercise).map(score));

export function toCSV(list) {
  const head = 'date,exercise,reps,hold_seconds,duration_seconds,technique_percent,goal,goal_reached';
  const rows = list.map((r) => [r.date, r.exercise, r.reps || 0, r.holdSeconds || 0, r.duration || 0, r.technique || 0, r.goal || 0, r.goalReached ? 1 : 0].join(','));
  return [head, ...rows].join('\n');
}
