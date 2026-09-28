// MediaPipe отдаёт только координаты точек тела. Всё остальное — наша логика.
const CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/';
const LINKS = [[11,12],[11,13],[13,15],[12,14],[14,16],[11,23],[12,24],[23,24],[23,25],[25,27],[24,26],[26,28]];
let pose = null;

export async function initPose(onLandmarks) {
  if (!window.Pose) throw new Error('MediaPipe не загрузился. Проверь интернет.');
  pose = new window.Pose({ locateFile: (f) => CDN + f });
  pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
  pose.onResults((r) => onLandmarks(r.poseLandmarks || null));
  await pose.initialize();
}

export const sendFrame = (video) => pose.send({ image: video });

export function drawSkeleton(canvas, landmarks, color) {
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
}
