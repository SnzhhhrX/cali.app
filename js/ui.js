import { getTips, summary as makeSummary } from './content.js';
import { t, getLang, setLang, translateError } from './i18n.js';

const $ = (id) => document.getElementById(id);
export const fmt = (sec) => String(Math.floor(sec / 60)).padStart(2, '0') + ':' + String(sec % 60).padStart(2, '0');

export const els = {
  video: $('video'),
  canvas: $('canvas'),
  select: $('exercise'),
  start: $('startBtn'),
  finish: $('finishBtn'),
  again: $('againBtn'),
};

export function applyLanguage() {
  const lang = getLang();
  document.documentElement.lang = lang;

  // Header
  const tag = document.querySelector('[data-i18n="tagline"]');
  if (tag) tag.textContent = t('tagline');

  // Welcome
  const wTitle = $('welcomeTitle');
  if (wTitle) wTitle.textContent = t('welcomeTitle');
  const wSub = $('welcomeSubtitle');
  if (wSub) wSub.textContent = t('welcomeSubtitle');
  $('btnStartApp') && ($('btnStartApp').textContent = t('startApp'));
  $('btnEditContent') && ($('btnEditContent').textContent = t('editContent'));
  $('tabAbout') && ($('tabAbout').textContent = t('about'));
  $('tabMission') && ($('tabMission').textContent = t('mission'));
  $('tabFeatures') && ($('tabFeatures').textContent = t('features'));

  // Controls
  const exLabel = document.querySelector('[data-i18n="exercise"]');
  if (exLabel) exLabel.childNodes[0].textContent = t('exercise') + ' ';
  const optS = document.querySelector('#exercise option[value="squat"]');
  const optP = document.querySelector('#exercise option[value="pushup"]');
  const optL = document.querySelector('#exercise option[value="plank"]');
  if (optS) optS.textContent = t('squat');
  if (optP) optP.textContent = t('pushup');
  if (optL) optL.textContent = t('plank');

  const vt = $('voiceToggle');
  if (vt && vt.parentElement) {
    let span = vt.parentElement.querySelector('span');
    if (!span) {
      span = document.createElement('span');
      vt.parentElement.appendChild(span);
    }
    span.textContent = t('voiceSound');
  }

  els.start.textContent = t('startWorkout');
  els.finish.textContent = t('finishWorkout');
  $('againBtn') && ($('againBtn').textContent = t('newWorkout'));
  $('resultTitle') && ($('resultTitle').textContent = t('workoutComplete'));

  // Cards labels
  setText('[data-i18n="exerciseCard"]', t('exerciseCard'));
  setText('[data-i18n="technique"]', t('technique'));
  setText('[data-i18n="time"]', t('time'));
  setText('[data-i18n="state"]', t('state'));
  setText('[data-i18n="feedback"]', t('feedback'));
  setText('[data-i18n="howItWorks"]', t('howItWorks'));
  setText('[data-i18n="howItWorksText"]', t('howItWorksText'));
  setText('[data-i18n="history"]', t('history'));
  $('clearBtn') && ($('clearBtn').textContent = t('clear'));

  // Camera tools
  $('flipBtn') && ($('flipBtn').setAttribute('aria-label', t('flipCamera')));
  $('flipLabel') && ($('flipLabel').textContent = t('flipCamera'));
  $('fsBtn') && ($('fsBtn').setAttribute('aria-label', t('fullscreen')));
  $('fsLabel') && ($('fsLabel').textContent = t('fullscreen'));
  $('hudFinish') && ($('hudFinish').setAttribute('aria-label', t('finishWorkout')));
  const hudFinishLabel = $('hudFinishLabel');
  if (hudFinishLabel) hudFinishLabel.textContent = t('finishWorkout');
  else if ($('hudFinish')) $('hudFinish').textContent = t('finishWorkout');

  // Lang buttons
  document.querySelectorAll('.lang-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.lang === lang);
  });

  // Re-apply exercise dependent
  if (els.select) setExercise(els.select.value);

  // Edit modal labels
  const editMap = {
    editTitle: 'editTitle', editAbout: 'editAbout', editMission: 'editMission',
    editFeatures: 'editFeatures', editSaved: 'editSaved', resetDefaults: 'resetDefaults',
    save: 'save', cancel: 'cancel'
  };
  document.querySelectorAll('[data-i18n-edit]').forEach((el) => {
    const key = el.getAttribute('data-i18n-edit');
    if (key && editMap[key]) el.textContent = t(editMap[key]);
  });
  $('editSave') && ($('editSave').textContent = t('save'));
  $('editCancel') && ($('editCancel').textContent = t('cancel'));
  $('editReset') && ($('editReset').textContent = t('resetDefaults'));

  // Content panels from storage or defaults
  renderWelcomeContent();
}

function setText(sel, text) {
  document.querySelectorAll(sel).forEach((el) => { el.textContent = text; });
}

export function setRunning(running) {
  els.start.hidden = running;
  els.finish.hidden = !running;
  els.select.disabled = running;
  $('hud').hidden = !running;
  $('hudFinish').hidden = !running;
  document.body.classList.toggle('is-running', running);
}

export function setLoading(text) {
  const ph = $('placeholder');
  if (!ph) return;
  ph.textContent = text;
  ph.hidden = !text;
}

export function setCamSize(w, h) {
  const cam = $('camera');
  if (cam) cam.style.aspectRatio = `${w} / ${h}`;
  els.canvas.width = w;
  els.canvas.height = h;
}

export function setExercise(name) {
  const names = { squat: t('squat'), pushup: t('pushup'), plank: t('plank') };
  $('exName') && ($('exName').textContent = names[name] || name);
  const label = name === 'plank' ? t('time') : t('reps');
  $('counterLabel') && ($('counterLabel').textContent = label);
  $('hudLabel') && ($('hudLabel').textContent = label);
  setCounter(name === 'plank' ? '00:00' : 0);
  const tips = getTips(name);
  const tipsEl = $('tips');
  if (tipsEl) {
    tipsEl.innerHTML = `<span data-i18n="tipsTitle">${t('tipsTitle')}</span><p>${tips.setup}</p><ul>${tips.points.map((x) => `<li>${x}</li>`).join('')}</ul>`;
  }
}

export const setCounter = (v) => {
  $('counter') && ($('counter').textContent = v);
  $('hudCounter') && ($('hudCounter').textContent = v);
};
export const setTimer = (sec) => {
  const f = fmt(sec);
  $('timer') && ($('timer').textContent = f);
  $('hudTime') && ($('hudTime').textContent = f);
};
export const setConfidence = (c) => {
  $('hudConf') && ($('hudConf').textContent = t('visibility') + ': ' + (c ? Math.round(c * 100) + '%' : '—'));
};
export const setMirror = (on) => $('camera')?.classList.toggle('mirror', on);
export const toggleFull = () => {
  const cam = $('camera');
  if (!cam) return;
  cam.classList.toggle('full');
  const isFull = cam.classList.contains('full');
  $('fsLabel') && ($('fsLabel').textContent = isFull ? t('exitFullscreen') : t('fullscreen'));
};
export const setState = (s) => { $('state') && ($('state').textContent = s || '—'); };

export function setFeedback(text, kind) {
  const translated = translateError(text);
  $('feedback') && ($('feedback').textContent = translated);
  $('hudMsg') && ($('hudMsg').textContent = translated);
  if ($('hudMsg')) $('hudMsg').dataset.kind = kind;
  if ($('feedbackCard')) $('feedbackCard').dataset.kind = kind;
  const tech = { good: t('techniqueGood'), bad: t('techniqueFix'), warn: '—', idle: '—' }[kind];
  if ($('technique')) {
    $('technique').textContent = tech;
    $('technique').dataset.kind = kind;
  }
}

export function showResult(r) {
  const names = { squat: t('squat'), pushup: t('pushup'), plank: t('plank') };
  const main = r.exercise === 'plank'
    ? `${t('plankHold')}: ${fmt(r.holdSeconds)}`
    : `${names[r.exercise] || r.exercise}: ${r.reps}`;
  const body = $('resultBody');
  if (body) {
    body.innerHTML = `
      <p>${main}</p>
      <p>${t('techniqueLabel')}: ${r.technique || r.reps || r.holdSeconds ? r.technique + '%' : '—'}</p>
      <p>${t('duration')}: ${fmt(r.duration)}</p>
      <p class="summary">${r.summary}</p>`;
  }
  $('result') && ($('result').hidden = false);
}

export const hideResult = () => { $('result') && ($('result').hidden = true); };
export const showError = (msg) => setLoading(msg);

export function renderHistory(list) {
  const best = list.length ? Math.max(...list.map((r) => r.technique)) : 0;
  const reps = list.reduce((sum, r) => sum + (r.reps || 0), 0);
  const stats = $('stats');
  if (stats) {
    stats.textContent = list.length
      ? `${t('statsWorkouts')}: ${list.length} · ${t('statsBest')}: ${best}% · ${t('statsReps')}: ${reps}`
      : '';
  }
  const names = { squat: t('squat'), pushup: t('pushup'), plank: t('plank') };
  const hist = $('history');
  if (!hist) return;
  hist.innerHTML = list.length
    ? list.map((r) => {
        const d = new Date(r.date);
        const locale = getLang() === 'ru' ? 'ru-RU' : 'en-US';
        const when = d.toLocaleDateString(locale, { day: '2-digit', month: '2-digit' }) + ' ' +
          d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
        const res = r.exercise === 'plank' ? fmt(r.holdSeconds) : '×' + r.reps;
        return `<li><span>${when}</span><b>${names[r.exercise] || r.exercise} ${res}</b><em>${r.technique}%</em></li>`;
      }).join('')
    : `<li class="empty">${t('emptyHistory')}</li>`;
}

// ——— Welcome content (editable) ———
const CONTENT_KEY = 'cali_welcome_content';

export function loadWelcomeContent() {
  try {
    const raw = localStorage.getItem(CONTENT_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function saveWelcomeContent(data) {
  try {
    localStorage.setItem(CONTENT_KEY, JSON.stringify(data));
  } catch {}
}

export function getWelcomeTexts() {
  const saved = loadWelcomeContent();
  const lang = getLang();
  if (saved && saved[lang]) return saved[lang];
  return {
    about: t('defaultAbout'),
    mission: t('defaultMission'),
    features: t('defaultFeatures'),
  };
}

export function renderWelcomeContent() {
  const texts = getWelcomeTexts();
  const aboutEl = $('welcomeAbout');
  const missionEl = $('welcomeMission');
  const featuresEl = $('welcomeFeatures');
  if (aboutEl) aboutEl.textContent = texts.about;
  if (missionEl) missionEl.textContent = texts.mission;
  if (featuresEl) {
    const lines = (texts.features || '').split('\n').filter(Boolean);
    featuresEl.innerHTML = lines.map((l) => `<li>${l.replace(/^[•\-\*]\s*/, '')}</li>`).join('');
  }
}

export function showWelcome() {
  $('welcome') && ($('welcome').hidden = false);
  $('mainApp') && ($('mainApp').hidden = true);
  document.body.classList.add('on-welcome');
}

export function hideWelcome() {
  $('welcome') && ($('welcome').hidden = true);
  $('mainApp') && ($('mainApp').hidden = false);
  document.body.classList.remove('on-welcome');
}

export function openEditModal() {
  const texts = getWelcomeTexts();
  $('editAbout') && ($('editAbout').value = texts.about);
  $('editMission') && ($('editMission').value = texts.mission);
  $('editFeatures') && ($('editFeatures').value = texts.features);
  $('editModal') && ($('editModal').hidden = false);
}

export function closeEditModal() {
  $('editModal') && ($('editModal').hidden = true);
}

export function saveEditModal() {
  const lang = getLang();
  const existing = loadWelcomeContent() || {};
  existing[lang] = {
    about: $('editAbout')?.value || '',
    mission: $('editMission')?.value || '',
    features: $('editFeatures')?.value || '',
  };
  saveWelcomeContent(existing);
  renderWelcomeContent();
  closeEditModal();
}

export function resetEditDefaults() {
  const lang = getLang();
  const existing = loadWelcomeContent() || {};
  delete existing[lang];
  saveWelcomeContent(existing);
  renderWelcomeContent();
  openEditModal();
}
