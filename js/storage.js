// История тренировок в localStorage (без backend).
const KEY = 'cali_history';
export function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
}
export function save(result) {
  const list = [{ ...result, date: new Date().toISOString() }, ...load()].slice(0, 60);
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch {}
}
export const clear = () => { try { localStorage.removeItem(KEY); } catch {} };
