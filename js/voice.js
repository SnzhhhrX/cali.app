// Голосовые подсказки и звуки
import { speechLang } from './i18n.js';

let enabled = true, audio = null;
const files = {};
const play = (name) => {
  try {
    files[name] = files[name] || new Audio(`assets/sounds/${name}.wav`);
    files[name].currentTime = 0;
    files[name].play().catch(() => fallback());
  } catch { fallback(); }
};
function fallback() {
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const o = audio.createOscillator(), g = audio.createGain();
    o.frequency.value = 880; g.gain.value = 0.08;
    o.connect(g); g.connect(audio.destination);
    o.start(); o.stop(audio.currentTime + 0.12);
  } catch {}
}

export const setEnabled = (v) => { enabled = v; if (!v) window.speechSynthesis?.cancel(); };
export function speak(text) {
  if (!enabled || !window.speechSynthesis) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = speechLang();
  speechSynthesis.speak(u);
}
export const beep = () => enabled && play('rep');
export const tick = () => enabled && play('tick');
export const go = () => enabled && play('go');
export const done = () => enabled && play('done');
