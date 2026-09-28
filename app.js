import { startCamera, stopCamera } from './js/camera.js';
import { initPose, sendFrame, drawSkeleton } from './js/pose.js';
import { createExercise } from './js/exercises.js';
import { analyze } from './js/errorMode.js';
import * as workout from './js/workout.js';
import * as ui from './js/ui.js';
import * as voice from './js/voice.js';
import * as storage from './js/storage.js';
import { summary } from './js/content.js';
import { T } from './utils/thresholds.js';
import { t, setLang, getLang, translateError } from './js/i18n.js';

let wakeLock = null, exercise = null, poseReady = false, running = false, lastFrame = 0, lastError = { text: '', at: 0 }, timerId = null, lastSpoken = 0, facing = 'user';
const COLORS = { good: '#3ddc84', bad: '#ff5d5d', warn: '#8a8f98' };

function onLandmarks(lm) {
  if (!running) return;
  const now = performance.now(), dt = Math.min(now - lastFrame, 200);
  lastFrame = now;
  if (!lm) {
    ui.setConfidence(0);
    drawSkeleton(ui.els.canvas, null);
    return ui.setFeedback(t('personNotFound'), 'warn');
  }

  const r = exercise.update(lm);
  ui.setConfidence(r.confidence);
  if (r.confidence < T.MIN_CONFIDENCE) {
    drawSkeleton(ui.els.canvas, lm, COLORS.warn);
    return ui.setFeedback(t('bodyNotVisible'), 'warn');
  }
  ui.setState(r.state);

  if (!r.inPosition) {
    drawSkeleton(ui.els.canvas, lm, COLORS.warn);
    return ui.setFeedback(t('takePosition'), 'warn');
  }

  const name = exercise.name, errors = analyze(name, r);
  if (r.repDone) { workout.addRep(); voice.beep(); }
  if (name === 'plank') {
    workout.addHold(dt);
    ui.setCounter(ui.fmt(workout.getHoldSeconds()));
  } else {
    ui.setCounter(workout.getReps());
  }
  workout.addFrame(errors.length === 0);

  if (errors.length) {
    lastError = { text: errors[0], at: now };
    workout.addError(errors[0]);
    if (now - lastSpoken > 3500) {
      voice.speak(translateError(errors[0]));
      lastSpoken = now;
    }
  }
  const holding = now - lastError.at < 1200;
  if (errors.length || holding) ui.setFeedback(lastError.text, 'bad');
  else ui.setFeedback(t('goodForm'), 'good');
  drawSkeleton(ui.els.canvas, lm, errors.length || holding ? COLORS.bad : COLORS.good);
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
  try {
    ui.setLoading(t('requestingCamera'));
    const size = await startCamera(ui.els.video, facing);
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

  for (const n of [3, 2, 1]) {
    ui.setLoading(t('startIn') + ' ' + n);
    voice.tick();
    await new Promise((r) => setTimeout(r, 1000));
  }
  voice.go();
  try { wakeLock = await navigator.wakeLock?.request('screen'); } catch {}
  const name = ui.els.select.value;
  exercise = createExercise(name);
  workout.start(name);
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
  ui.setLoading(t('pressStart'));
  const result = workout.finish();
  result.summary = summary(result);
  if (result.reps || result.holdSeconds) {
    storage.save(result);
    voice.done();
  }
  ui.renderHistory(storage.load());
  ui.showResult(result);
}

// ——— Init ———
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
  storage.clear();
  ui.renderHistory([]);
});

document.getElementById('fsBtn')?.addEventListener('click', ui.toggleFull);
document.getElementById('hudFinish')?.addEventListener('click', finishWorkout);

document.addEventListener('visibilitychange', async () => {
  if (running && !document.hidden) {
    try { wakeLock = await navigator.wakeLock?.request('screen'); } catch {}
  }
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

document.getElementById('flipBtn')?.addEventListener('click', async () => {
  facing = facing === 'user' ? 'environment' : 'user';
  ui.setMirror(facing === 'user');
  if (!running) return;
  try {
    stopCamera(ui.els.video);
    const s = await startCamera(ui.els.video, facing);
    ui.setCamSize(s.width, s.height);
  } catch (e) {
    ui.setFeedback(e.message, 'warn');
  }
});

// Language switch
document.querySelectorAll('.lang-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    setLang(btn.dataset.lang);
    ui.applyLanguage();
  });
});

// Welcome → app
document.getElementById('btnStartApp')?.addEventListener('click', () => {
  ui.hideWelcome();
});

// Edit content
document.getElementById('btnEditContent')?.addEventListener('click', () => ui.openEditModal());
document.getElementById('editSave')?.addEventListener('click', () => ui.saveEditModal());
document.getElementById('editCancel')?.addEventListener('click', () => ui.closeEditModal());
document.getElementById('editReset')?.addEventListener('click', () => ui.resetEditDefaults());

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
