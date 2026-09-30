import { t } from './i18n.js';

let stream = null;

export async function startCamera(video, facing = 'user') {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error(t('cam_unavailable'));
  }
  stopCamera(video);
  const preferred = { video: { facingMode: { ideal: facing }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false };
  try {
    stream = await navigator.mediaDevices.getUserMedia(preferred);
  } catch (e) {
    // Некоторые мобильные браузеры не принимают ideal/facingMode вместе с разрешением.
    if (e.name === 'NotAllowedError') throw new Error(t('cam_denied'));
    if (e.name === 'NotFoundError' || e.name === 'OverconstrainedError') {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      } catch (retry) {
        if (retry.name === 'NotAllowedError') throw new Error(t('cam_denied'));
        if (retry.name === 'NotFoundError') throw new Error(t('cam_not_found'));
        throw new Error(t('cam_failed') + ': ' + retry.message);
      }
    } else {
      throw new Error(t('cam_failed') + ': ' + e.message);
    }
  }
  video.srcObject = stream;
  await video.play();
  return { width: video.videoWidth, height: video.videoHeight };
}

// Демо-режим: вместо камеры крутим загруженное видео (удобно для тестов и презентации)
// loop=true — видео идёт без остановки, счётчик повторений накапливается между циклами
export async function startVideoFile(video, url) {
  stopCamera(video);
  video.removeAttribute('srcObject');
  video.srcObject = null;
  video.src = url;
  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  try {
    await video.play();
  } catch {
    throw new Error(t('videoFailed'));
  }
  // Ждём метаданные, чтобы width/height были корректны
  if (!video.videoWidth) {
    await new Promise((r) => {
      if (video.videoWidth) return r();
      video.addEventListener('loadedmetadata', r, { once: true });
    });
  }
  return { width: video.videoWidth, height: video.videoHeight };
}

export function stopCamera(video) {
  stream?.getTracks().forEach((t) => t.stop());
  stream = null;
  video.pause?.();
  video.srcObject = null;
  // Не сбрасываем video.src при демо — файл может ещё понадобиться
}
