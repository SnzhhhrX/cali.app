import { t } from './i18n.js';

let stream = null;

export async function startCamera(video, facing = 'user') {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error(t('cam_unavailable'));
  }
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,
    });
  } catch (e) {
    if (e.name === 'NotAllowedError') throw new Error(t('cam_denied'));
    if (e.name === 'NotFoundError') throw new Error(t('cam_not_found'));
    throw new Error(t('cam_failed') + ': ' + e.message);
  }
  video.srcObject = stream;
  await video.play();
  return { width: video.videoWidth, height: video.videoHeight };
}

export function stopCamera(video) {
  stream?.getTracks().forEach((t) => t.stop());
  stream = null;
  video.srcObject = null;
}
