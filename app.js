import { startCamera, stopCamera, startVideoFile } from './js/camera.js';
import { initPose, sendFrame, drawSkeleton } from './js/pose.js';
import { createExercise } from './js/exercises.js';
import { analyze } from './js/errorMode.js';
import * as workout from './js/workout.js';
import * as ui from './js/ui.js';
import * as voice from './js/voice.js';
import * as storage from './js/storage.js';
import { summary } from './js/content.js';
import { unlockedIds, bestOf, toCSV } from './js/stats.js';
import { T } from './utils/thresholds.js';
import { t, setLang, getLang, translateError, tRu } from './js/i18n.js';

let wakeLock = null, exercise = null, poseReady = false, running = false, lastFrame = 0, lastError = { text: '', at: 0 }, timerId = null, lastSpoken = 0, facing = 'user';
const COLORS = { good: '#3ddc84', bad: '#ff5d5d', warn: '#8a8f98' };
let demoUrl = null; // загруженное видео вместо камеры
let showAngles = (() => { try { return localStorage.getItem('cali_angles') !== '0'; } catch { return true; } })();
const angleName = () => (showAngles ? exercise.name : null);
function getFrameStatus(lm) {
  const ids = [11, 12, 15, 16, 23, 24, 25, 26, 27, 28];
  const visible = ids.filter((i) => (lm[i]?.visibility ?? 0) >= 0.45);
  if (visible.length < 6) return 'edge';
  const xs = visible.map((i) => lm[i].x), ys = visible.map((i) => lm[i].y);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const width = maxX - minX, height = maxY - minY;
  if (minX < 0.04 || maxX > 0.96 || minY < 0.04 || maxY > 0.96) return 'edge';
  if (width > 0.9 || height > 0.94) return 'close';
  if (width < 0.22 || height < 0.42) return 'far';
  return 'ready';
}

function updateFrameGuide(lm, kind) {
  const el = document.getElementById('frameGuide');
  const text = document.getElementById('frameGuideText');
  if (!el || !text) return;
  if (!lm || kind === 'edge') { el.hidden = !lm; text.textContent = t('frameEdge'); el.dataset.kind = 'warn'; return; }
  const key = kind === 'close' ? 'frameTooClose' : kind === 'far' ? 'frameTooFar' : 'frameReady';
  text.textContent = t(key);
  el.dataset.kind = kind === 'ready' ? 'good' : 'warn';
  el.hidden = false;
}


function onLandmarks(lm) {
  if (!running || workout.isPaused()) return;
  const now = performance.now(), dt = Math.min(now - lastFrame, 200);
  lastFrame = now;
  if (!lm) {
    updateFrameGuide(null);
    ui.setConfidence(0);
    drawSkeleton(ui.els.canvas, null);
    return ui.setFeedback(t('personNotFound'), 'warn');
  }

  const r = exercise.update(lm);
  updateFrameGuide(lm, getFrameStatus(lm));
  ui.setConfidence(r.confidence);
  if (r.confidence < T.MIN_CONFIDENCE) {
    drawSkeleton(ui.els.canvas, lm, COLORS.warn, angleName());
    return ui.setFeedback(t('bodyNotVisible'), 'warn');
  }
  ui.setState(r.state);

  if (!r.inPosition) {
    drawSkeleton(ui.els.canvas, lm, COLORS.warn, angleName());
    return ui.setFeedback(t('takePosition'), 'warn');
  }

  const name = exercise.name, errors = analyze(name, r);
  if (r.repDone) {
    workout.addRep();
    voice.beep();
    try { if (navigator.vibrate) navigator.vibrate(40); } catch {}
  }
  if (name === 'plank') {
    workout.addHold(dt);
    ui.setCounter(ui.fmt(workout.getHoldSeconds()));
  } else {
    ui.setCounter(workout.getReps());
  }
  workout.addFrame(errors.length === 0);
  ui.setLiveTechnique(errors.length === 0);

  const gp = workout.goalProgress();
  if (gp != null) {
    ui.setGoalProgress(gp);
    if (workout.checkGoal()) { // цель достигнута — завершаем тренировку сами
      voice.done(); voice.speak(t('goalDone'), tRu('goalDone'));
      setTimeout(() => running && finishWorkout(), 1500);
    }
  }

  if (errors.length) {
    lastError = { text: errors[0], at: now };
    workout.addError(errors[0]);
    if (now - lastSpoken > 3500) {
      voice.speak(translateError(errors[0]), errors[0]);
      lastSpoken = now;
    }
  }
  const holding = now - lastError.at < 1200;
  if (errors.length || holding) ui.setFeedback(lastError.text, 'bad');
  else ui.setFeedback(t('goodForm'), 'good');
  drawSkeleton(ui.els.canvas, lm, errors.length || holding ? COLORS.bad : COLORS.good, angleName());
}

async function loop() {
  const v = ui.els.video;
  while (running) {
    if (v.readyState >= 2) await sendFrame(v);
    await new Promise(requestAnimationFrame);
  }
}

async function startWorkout() {
  ui.hideResult();
  ui.els.start.disabled = true;
  const isVideo = !!demoUrl;
  try {
    ui.setLoading(isVideo ? t('loadingModel') : t('requestingCamera'));
    ui.setMirror(!isVideo && facing === 'user');
    const size = isVideo ? await startVideoFile(ui.els.video, demoUrl) : await startCamera(ui.els.video, facing);
    ui.setCamSize(size.width, size.height);
    if (!poseReady) {
      ui.setLoading(t('loadingModel'));
      await initPose(onLandmarks);
      poseReady = true;
    }
  } catch (e) {
    ui.showError(e.message);
    stopCamera(ui.els.video);
    ui.els.start.disabled = false;
    return;
  }

  // Обратный отсчёт только для камеры; для видео сразу анализ
  if (!isVideo) {
    for (const n of [3, 2, 1]) {
      ui.setLoading(t('startIn') + ' ' + n);
      voice.tick();
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  if (isVideo) ui.els.video.currentTime = 0;
  voice.go();
  try { wakeLock = await navigator.wakeLock?.request('screen'); } catch {}
  const name = ui.els.select.value;
  exercise = createExercise(name);
  workout.start(name, ui.getGoal());
  ui.setGoalProgress(workout.goalProgress());
  ui.setExercise(name);
  ui.setTimer(0);
  ui.setRunning(true);
  ui.setLoading('');
  ui.setFeedback(t('standInFrame'), 'idle');
  ui.els.start.disabled = false;
  running = true;
  lastFrame = performance.now();
  timerId = setInterval(() => ui.setTimer(workout.getElapsedSeconds()), 500);
  loop();
}

function togglePause() {
  if (!running) return;
  if (workout.isPaused()) {
    workout.resume();
    lastFrame = performance.now();
    ui.setPaused(false);
    ui.setFeedback(t('standInFrame'), 'idle');
  } else {
    workout.pause();
    window.speechSynthesis?.cancel();
    ui.setPaused(true);
  }
}

function finishWorkout() {
  running = false;
  clearInterval(timerId);
  wakeLock?.release().catch(() => {});
  wakeLock = null;
  document.getElementById('camera')?.classList.remove('full');
  window.speechSynthesis?.cancel();
  stopCamera(ui.els.video);
  drawSkeleton(ui.els.canvas, null);
  ui.setRunning(false);
  updateFrameGuide(null);
  ui.setLoading(t('pressStart'));
  const result = workout.finish();
  result.summary = summary(result);
  if (result.reps || result.holdSeconds) {
    const prev = storage.load(), before = unlockedIds(prev);
    const value = result.exercise === 'plank' ? result.holdSeconds : result.reps, prevBest = bestOf(prev, result.exercise);
    storage.save(result);
    result.record = prevBest > 0 && value > prevBest; // личный рекорд (не считаем самый первый подход)
    result.newBadges = unlockedIds(storage.load()).filter((id) => !before.includes(id));
    voice.done();
  }
  ui.renderHistory(storage.load());
  ui.showResult(result);
}

// ——— Init ———
try { localStorage.removeItem('cali_welcome_content'); } catch {} // старый редактор текста удалён
ui.applyLanguage();
ui.showWelcome();
ui.setLoading(t('pressStart'));
ui.renderHistory(storage.load());
ui.setExercise(ui.els.select?.value || 'squat');

// Events
ui.els.start.onclick = startWorkout;
ui.els.finish.onclick = finishWorkout;
ui.els.again.onclick = ui.hideResult;
ui.els.select.onchange = () => ui.setExercise(ui.els.select.value);

document.getElementById('voiceToggle')?.addEventListener('change', (e) => voice.setEnabled(e.target.checked));
document.getElementById('clearBtn')?.addEventListener('click', () => {
  if (!confirm(t('confirmClear'))) return;
  storage.clear();
  ui.renderHistory([]);
});

document.getElementById('fsBtn')?.addEventListener('click', ui.toggleFull);
document.getElementById('hudFinish')?.addEventListener('click', finishWorkout);

document.addEventListener('visibilitychange', async () => {
  if (running && document.hidden && !workout.isPaused()) togglePause(); // свернул вкладку — пауза
  if (running && !document.hidden) {
    try { wakeLock = await navigator.wakeLock?.request('screen'); } catch {}
  }
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

document.getElementById('flipBtn')?.addEventListener('click', async (e) => {
  if (demoUrl || e.currentTarget.disabled) return;
  const previousFacing = facing;
  const nextFacing = facing === 'user' ? 'environment' : 'user';
  e.currentTarget.disabled = true;
  try {
    if (running) {
      stopCamera(ui.els.video);
      const s = await startCamera(ui.els.video, nextFacing);
      ui.setCamSize(s.width, s.height);
    }
    facing = nextFacing;
    ui.setMirror(facing === 'user');
  } catch (err) {
    facing = previousFacing;
    ui.setMirror(facing === 'user');
    ui.setFeedback(err.message, 'warn');
  } finally {
    e.currentTarget.disabled = false;
  }
});

// Language switch
document.querySelectorAll('.lang-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    setLang(btn.dataset.lang);
    ui.applyLanguage();
  });
});

// Welcome → app (обе кнопки «Начать») и обратно по клику на логотип
document.querySelectorAll('.btn-cta').forEach((b) => b.addEventListener('click', ui.hideWelcome));
document.getElementById('logoHome')?.addEventListener('click', (e) => {
  e.preventDefault();
  if (!running) ui.showWelcome();
});

// Welcome tabs
document.querySelectorAll('.welcome-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.welcome-tab').forEach((x) => x.classList.remove('active'));
    document.querySelectorAll('.welcome-panel').forEach((p) => p.classList.remove('active'));
    tab.classList.add('active');
    const panel = document.getElementById('panel-' + tab.dataset.panel);
    if (panel) panel.classList.add('active');
  });
});

// Пауза
document.getElementById('pauseBtn')?.addEventListener('click', togglePause);
document.getElementById('hudPause')?.addEventListener('click', togglePause);

// Клавиатура: Esc — закрыть итог / fullscreen; Space — старт / пауза; F — fullscreen
document.addEventListener('keydown', (e) => {
  const tag = (e.target && e.target.tagName) || '';
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
  if (e.key === 'Escape') {
    if (!document.getElementById('result').hidden) ui.hideResult();
    else if (document.getElementById('camera').classList.contains('full')) ui.toggleFull();
    return;
  }
  if (e.code === 'Space' || e.key === ' ') {
    e.preventDefault();
    if (!document.getElementById('result').hidden) return;
    if (document.body.classList.contains('on-welcome')) return;
    if (running) togglePause();
    else if (!ui.els.start.disabled) startWorkout();
    return;
  }
  if ((e.key === 'f' || e.key === 'F') && running) {
    e.preventDefault();
    ui.toggleFull();
  }
});
document.getElementById('result')?.addEventListener('click', (e) => {
  if (e.target.id === 'result') ui.hideResult();
});

// Экспорт истории в CSV
document.getElementById('exportBtn')?.addEventListener('click', () => {
  const list = storage.load();
  if (!list.length) return;
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(new Blob([toCSV(list)], { type: 'text/csv;charset=utf-8' })),
    download: 'cali-history.csv',
  });
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
});

// Углы на скелете (настройка запоминается)
const anglesToggle = document.getElementById('anglesToggle');
if (anglesToggle) {
  anglesToggle.checked = showAngles;
  anglesToggle.addEventListener('change', () => {
    showAngles = anglesToggle.checked;
    try { localStorage.setItem('cali_angles', showAngles ? '1' : '0'); } catch {}
  });
}

// Видео вместо камеры (демо-режим)
const demoFile = document.getElementById('demoFile');
function clearDemo() {
  if (demoUrl) URL.revokeObjectURL(demoUrl);
  demoUrl = null;
  if (demoFile) demoFile.value = '';
  ui.setDemoName('');
  ui.updateStartLabel(false);
  ui.setMirror(facing === 'user');
}
document.getElementById('demoBtn')?.addEventListener('click', () => {
  if (running) return;
  if (!demoUrl) return demoFile.click();
  clearDemo();
});
demoFile?.addEventListener('change', () => {
  const f = demoFile.files[0];
  if (!f) return;
  if (demoUrl) URL.revokeObjectURL(demoUrl);
  demoUrl = URL.createObjectURL(f);
  ui.setDemoName(f.name);
  ui.updateStartLabel(true);
});
