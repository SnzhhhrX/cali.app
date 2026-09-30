// MediaPipe отдаёт только координаты точек тела. Всё остальное — наша логика.
import { angle } from '../utils/angles.js';

const CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/';
const LINKS = [[11,12],[11,13],[13,15],[12,14],[14,16],[11,23],[12,24],[23,24],[23,25],[25,27],[24,26],[26,28]];
// Какие углы показываем на скелете: пары [левая сторона, правая] — рисуем ту, что видна лучше.
// Те же тройки точек, что использует exercises.js, поэтому цифры совпадают с логикой подсчёта.
const ANGLES = {
  squat: [[[23, 25, 27], [24, 26, 28]], [[11, 23, 25], [12, 24, 26]]],
  pushup: [[[11, 13, 15], [12, 14, 16]], [[11, 23, 27], [12, 24, 28]]],
  plank: [[[11, 23, 25], [12, 24, 26]]],
};
let pose = null;

export async function initPose(onLandmarks) {
  if (!window.Pose) throw new Error('MediaPipe не загрузился. Проверь интернет.');
  pose = new window.Pose({ locateFile: (f) => CDN + f });
  pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
  pose.onResults((r) => onLandmarks(r.poseLandmarks || null));
  await pose.initialize();
}

export const sendFrame = (video) => pose.send({ image: video });

function drawAngles(ctx, canvas, lm, name, color) {
  const mirror = canvas.parentElement?.classList.contains('mirror'); // canvas отзеркален через CSS — текст разворачиваем обратно
  const fs = Math.max(13, Math.round(canvas.width / 46));
  ctx.font = `700 ${fs}px Manrope, system-ui, sans-serif`;
  ctx.textBaseline = 'middle';
  const vis = (tr) => Math.min(...tr.map((i) => lm[i].visibility ?? 0));
  for (const [left, right] of ANGLES[name] || []) {
    const tr = vis(left) >= vis(right) ? left : right;
    if (vis(tr) < 0.5) continue;
    const [a, b, c] = tr.map((i) => lm[i]);
    const text = Math.round(angle(a, b, c)) + '°';
    const w = ctx.measureText(text).width + fs * 0.9, h = fs * 1.7, gap = fs * 0.9;
    const x = b.x * canvas.width, y = b.y * canvas.height;
    const room = (mirror ? canvas.width - x : x) + gap + w < canvas.width; // хватает места справа на экране?
    ctx.save();
    ctx.translate(x, y);
    if (mirror) ctx.scale(-1, 1);
    ctx.translate(room ? gap : -gap - w, -h / 2 - fs * 0.6);
    ctx.fillStyle = 'rgba(11, 13, 11, 0.82)';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(0, 0, w, h, h / 2) : ctx.rect(0, 0, w, h);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#f4efe1';
    ctx.fillText(text, fs * 0.45, h / 2 + 1);
    ctx.restore();
  }
}

export function drawSkeleton(canvas, landmarks, color, anglesFor = null) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!landmarks) return;
  const p = (i) => [landmarks[i].x * canvas.width, landmarks[i].y * canvas.height];
  ctx.lineWidth = Math.max(3, canvas.width / 200);
  ctx.strokeStyle = color;
  for (const [a, b] of LINKS) {
    if (landmarks[a].visibility < 0.4 || landmarks[b].visibility < 0.4) continue;
    ctx.beginPath(); ctx.moveTo(...p(a)); ctx.lineTo(...p(b)); ctx.stroke();
  }
  ctx.fillStyle = '#fff';
  for (const i of [11,12,13,14,15,16,23,24,25,26,27,28]) {
    if (landmarks[i].visibility < 0.4) continue;
    ctx.beginPath(); ctx.arc(...p(i), ctx.lineWidth * 1.3, 0, Math.PI * 2); ctx.fill();
  }
  if (anglesFor) drawAngles(ctx, canvas, landmarks, anglesFor, color);
}
