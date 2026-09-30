import { getTips, summary as makeSummary } from './content.js';
import { t, getLang, setLang, translateError, dateLocale } from './i18n.js';
import { shareCard } from './share.js';
import { calcStats, BADGES, unlockedIds } from './stats.js';

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
  document.querySelectorAll('.btn-cta').forEach((b) => setCtaLabels(b, t('startApp')));
  const heroTitle = $('heroTitle');
  if (heroTitle) { heroTitle.textContent = t('heroTitle'); splitWords(heroTitle); }
  $('heroSub') && ($('heroSub').textContent = t('heroSub'));
  $('heroMeta') && ($('heroMeta').textContent = t('heroMeta'));
  $('heroChip') && ($('heroChip').textContent = t('heroChip'));
  $('heroImg') && ($('heroImg').alt = t('heroImgAlt'));
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

  updateStartLabel(!!demoName);
  els.finish.textContent = t('finishWorkout');
  $('againBtn') && ($('againBtn').textContent = t('newWorkout'));
  $('resultTitle') && ($('resultTitle').textContent = t('workoutComplete'));

  // Cards labels
  setText('[data-i18n="setupTitle"]', t('setupTitle'));
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

  setText('[data-i18n="goal"]', t('goal'));
  setText('[data-i18n="tipOfDay"]', t('tipOfDay'));
  setText('[data-i18n="faq"]', t('faq'));
  pauseLabels();
  setDemoName(demoName);
  renderExtras();
  renderHistory(histCache);

  renderWelcomeContent();
  requestAnimationFrame(syncWelcomeTabs); // подписи вкладок сменили ширину
}

function setText(sel, text) {
  document.querySelectorAll(sel).forEach((el) => { el.textContent = text; });
}

export function setRunning(running) {
  els.start.hidden = running;
  els.finish.hidden = !running;
  els.select.disabled = running;
  if ($('goal')) $('goal').disabled = running;
  if ($('demoBtn')) $('demoBtn').disabled = running;
  $('pauseBtn') && ($('pauseBtn').hidden = !running);
  $('hudPause') && ($('hudPause').hidden = !running);
  if (!running) { pausedUI = false; pauseLabels(); setGoalProgress(null); updateStartLabel(!!demoName); }
  else resetLiveTechnique();
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
  if (!document.body.classList.contains('is-running')) setCounter(name === 'plank' ? '00:00' : 0);
  fillGoals(name);
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
export const setState = (s) => {
  const tr = t('state_' + s);
  $('state') && ($('state').textContent = s ? (tr === 'state_' + s ? s : tr) : '—');
};

// ——— Пауза и цель ———
let pausedUI = false, histCache = [], demoName = '';
function pauseLabels() {
  const l = t(pausedUI ? 'resume' : 'pause');
  $('pauseBtn') && ($('pauseBtn').textContent = l);
  $('hudPauseLabel') && ($('hudPauseLabel').textContent = l);
  $('hudPause')?.classList.toggle('is-paused', pausedUI);
}
export function setDemoName(name) {
  demoName = name;
  $('demoBtn') && ($('demoBtn').textContent = name ? t('demoReset').replace('{n}', name) : t('demoVideo'));
  $('flipBtn') && ($('flipBtn').hidden = !!name); // при видео камеру менять нечем
  updateStartLabel(!!name);
}
/** Текст кнопки старта: «Начать тренировку» или «Анализ видео» */
export function updateStartLabel(isVideo) {
  if (!els.start || document.body.classList.contains('is-running')) return;
  els.start.textContent = isVideo ? t('analyzeVideo') : t('startWorkout');
}
export function setPaused(on) {
  pausedUI = on;
  pauseLabels();
  if (on) setFeedback(t('paused'), 'warn');
}
export const getGoal = () => Number($('goal')?.value) || 0;
export function setGoalProgress(p) {
  document.querySelectorAll('.goal-bar').forEach((b) => { b.hidden = p == null; });
  document.querySelectorAll('.goal-fill').forEach((f) => { f.style.width = Math.round((p || 0) * 100) + '%'; });
}
function fillGoals(name) {
  const sel = $('goal');
  if (!sel) return;
  const prev = sel.dataset.ex === name ? sel.value : '0';
  const plank = name === 'plank';
  sel.innerHTML = (plank ? [0, 30, 60, 90, 120] : [0, 10, 15, 20, 30])
    .map((v) => `<option value="${v}">${v ? t(plank ? 'goalSecs' : 'goalReps').replace('{n}', v) : t('goalNone')}</option>`).join('');
  sel.value = prev;
  sel.dataset.ex = name;
}

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

// Живой индикатор техники в scoreboard (только UI, не влияет на подсчёт)
let liveGood = 0, liveTotal = 0;
export function setLiveTechnique(isGood) {
  liveTotal++;
  if (isGood) liveGood++;
  const pct = liveTotal ? Math.round((liveGood / liveTotal) * 100) : 0;
  const fill = $('techFill');
  if (fill) {
    fill.style.width = pct + '%';
    fill.dataset.level = pct >= 80 ? 'good' : pct >= 50 ? 'mid' : 'low';
  }
}
export function resetLiveTechnique() {
  liveGood = 0;
  liveTotal = 0;
  const fill = $('techFill');
  if (fill) { fill.style.width = '0%'; fill.dataset.level = ''; }
}

export function showResult(r) {
  const names = { squat: t('squat'), pushup: t('pushup'), plank: t('plank') };
  const main = r.exercise === 'plank'
    ? `${t('plankHold')}: ${fmt(r.holdSeconds)}`
    : `${names[r.exercise] || r.exercise}: ${r.reps}`;
  const techNum = (r.technique || r.reps || r.holdSeconds) ? r.technique : null;
  const tech = techNum != null ? techNum + '%' : '—';
  const goalLine = r.goal ? `<p class="result-line"><span>${t('goal')}</span><b>${r.goalReached ? '✓ ' + t('goalReached') : t('goalMissed')}</b></p>` : '';
  const notes = (r.record ? `<p class="note">★ ${t('newRecord')}</p>` : '')
    + (r.newBadges?.length ? `<p class="note">◆ ${t('newBadge')}: ${r.newBadges.map((id) => t('b_' + id)).join(', ')}</p>` : '');

  // Кольцо техники в шапке модалки
  const ring = $('techRing');
  const ringFg = $('ringFg');
  const ringVal = $('ringVal');
  if (ring && ringFg && ringVal) {
    if (techNum != null) {
      ring.hidden = false;
      const circ = 2 * Math.PI * 34;
      const offset = circ * (1 - Math.min(100, Math.max(0, techNum)) / 100);
      ringFg.style.strokeDasharray = circ.toFixed(1);
      ringFg.style.strokeDashoffset = offset.toFixed(1);
      ringFg.dataset.level = techNum >= 80 ? 'good' : techNum >= 50 ? 'mid' : 'low';
      ringVal.textContent = techNum + '%';
    } else {
      ring.hidden = true;
    }
  }

  const body = $('resultBody');
  if (body) {
    body.innerHTML = `
      <div class="result-stats">
        <p class="result-hero">${main}</p>
        <p class="result-line"><span>${t('techniqueLabel')}</span><b>${tech}</b></p>
        <p class="result-line"><span>${t('duration')}</span><b>${fmt(r.duration)}</b></p>
        ${goalLine}
      </div>
      ${notes}
      <p class="summary">${r.summary}</p>
      <div class="modal-actions">
        <button type="button" id="shareBtn" class="btn ghost">${t('shareImg')}</button>
        <button type="button" id="copyBtn" class="btn ghost">${t('copyResult')}</button>
      </div>`;
    $('copyBtn').onclick = async (e) => {
      const text = `Cali.app · ${main} · ${t('techniqueLabel')}: ${tech} · ${t('duration')}: ${fmt(r.duration)}`;
      try { await navigator.clipboard.writeText(text); e.target.textContent = t('copied'); } catch {}
    };
    $('shareBtn').onclick = async (e) => {
      const btn = e.currentTarget;
      btn.disabled = true;
      const goalText = r.goal ? (r.goalReached ? '✓ ' + t('goalReached') : t('goalMissed')) : '';
      const status = await shareCard({
        subtitle: t('welcomeSubtitle'),
        title: names[r.exercise] || r.exercise,
        big: r.exercise === 'plank' ? fmt(r.holdSeconds) : String(r.reps),
        bigLabel: r.exercise === 'plank' ? t('plankHold') : t('reps'),
        stats: [[t('techniqueLabel'), tech], [t('duration'), fmt(r.duration)], ...(goalText ? [[t('goal'), goalText]] : [])],
        note: r.record ? '★ ' + t('newRecord') : (r.newBadges?.length ? '◆ ' + r.newBadges.map((id) => t('b_' + id)).join(', ') : ''),
        footer: new Date().toLocaleDateString(dateLocale(), { day: 'numeric', month: 'long', year: 'numeric' }),
      }).catch(() => 'error');
      btn.disabled = false;
      if (status === 'saved' || status === 'shared') btn.textContent = t('savedOk');
    };
  }
  if ($('result')) {
    lastFocused = document.activeElement;
    $('result').hidden = false;
    ($('againBtn') || $('resultTitle'))?.focus?.();
  }
}

export const hideResult = () => {
  if ($('result')) $('result').hidden = true;
  const target = lastFocused;
  lastFocused = null;
  const next = canTakeFocus(target) ? target
    : canTakeFocus(els.start) ? els.start : null;
  if (next) {
    try { next.focus({ preventScroll: true }); } catch { next.focus(); }
  }
};
export const showError = (msg) => setLoading(msg);

const fmtTotal = (sec) => {
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60);
  return h ? `${h}${t('unitH')} ${m}${t('unitM')}` : `${m || !sec ? m : '<1'}${t('unitM')}`;
};

function renderFaq(el) {
  if (el) el.innerHTML = [1, 2, 3, 4, 5, 6].map((i) => `<details><summary>${t('faq_q' + i)}</summary><p>${t('faq_a' + i)}</p></details>`).join('');
}

function renderExtras() {
  const tip = $('dailyTip');
  if (tip) tip.textContent = t('dtip_' + (Math.floor(Date.now() / 864e5) % 6));
  renderFaq($('faq'));
  renderFaq($('wFaq'));

  // Секции приветствия и все подписи с data-t
  document.querySelectorAll('[data-t]').forEach((el) => { el.textContent = t(el.dataset.t); });
  const st = $('wStats');
  if (st) st.innerHTML = [['3', 'wsEx'], ['0', 'wsSignup'], ['100%', 'wsLocal'], ['3', 'wsLangs']]
    .map(([b, k]) => `<div><b>${b}</b><span>${t(k)}</span></div>`).join('');
  const steps = $('wSteps');
  if (steps) steps.innerHTML = [1, 2, 3, 4]
    .map((i) => `<li><b>${i}</b><div><h4>${t('step' + i)}</h4><p>${t('step' + i + 'd')}</p></div></li>`).join('');
  const ex = $('wEx');
  if (ex) ex.innerHTML = ['squat', 'pushup', 'plank'].map((n) =>
    `<article class="w-card"><em>${t(n === 'plank' ? 'wexTime' : 'wexReps')}</em><h4>${t(n)}</h4><p>${t('wex_' + n + '_d')}</p>` +
    `<ul class="feature-list">${[1, 2, 3].map((i) => `<li>${t('wex_' + n + '_' + i)}</li>`).join('')}</ul></article>`).join('');
}

// ——— Дашборд статистики ———
export function renderDashboard(list) {
  const box = $('dashBody');
  if (!box) return;
  const s = calcStats(list);
  const locale = dateLocale();
  const names = { squat: t('squat'), pushup: t('pushup'), plank: t('plank') };
  const got = new Set(unlockedIds(list));

  const badges = BADGES.map((b) => {
    const on = got.has(b.id), p = !on && b.p ? b.p(s) : null;
    return `<div class="badge${on ? ' on' : ''}"><i aria-hidden="true">${on ? '◆' : '◇'}</i><div><b>${t('b_' + b.id)}</b>` +
      `<small>${t('b_' + b.id + '_d')}${p ? ` · ${Math.min(p[0], p[1])}/${p[1]}` : ''}</small></div></div>`;
  }).join('');
  const badgeBlock = `<div><h3 class="dash-h">${t('achievements')}<em>${got.size}/${BADGES.length}</em></h3><div class="badges">${badges}</div></div>`;

  if (!list.length) { box.innerHTML = `<p class="dash-empty">${t('dashEmpty')}</p>${badgeBlock}`; return; }

  const kpis = [[s.workouts, 'kWorkouts'], [s.reps, 'kReps'], [fmtTotal(s.seconds), 'kTime'], [s.avgTech + '%', 'kAvg'],
    [`${s.streak} ${t('days')}`, 'kStreak'], [`${s.bestStreak} ${t('days')}`, 'kBestStreak']]
    .map(([v, k]) => `<div class="kpi"><b>${v}</b><small>${t(k)}</small></div>`).join('');

  // график техники за последние 12 тренировок (старые слева)
  const pts = list.slice(0, 12).reverse().map((r) => r.technique || 0);
  const W = 300, x = (i) => (pts.length > 1 ? 12 + (i * (W - 24)) / (pts.length - 1) : W / 2), y = (v) => 10 + (100 - v) * 0.7;
  const trend = `<svg class="trend" viewBox="0 0 ${W} 90" role="img" aria-label="${t('trend')}">` +
    `<line x1="0" x2="${W}" y1="${y(100)}" y2="${y(100)}"/><line x1="0" x2="${W}" y1="${y(50)}" y2="${y(50)}"/>` +
    `<text x="2" y="${y(100) - 2}">100%</text><text x="2" y="${y(50) - 2}">50%</text>` +
    `<polyline points="${pts.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')}"/>` +
    pts.map((v, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="3.5"/>`).join('') + '</svg>';

  // активность за 7 дней
  const key = (d) => d.toDateString();
  const week = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d; });
  const cnt = week.map((d) => list.filter((r) => key(new Date(r.date)) === key(d)).length);
  const max = Math.max(1, ...cnt);
  const bars = week.map((d, i) => `<div class="week-day" title="${cnt[i]} ${t('workoutsWord')}"><i class="${cnt[i] ? 'on' : ''}" style="height:${Math.max(cnt[i] ? 14 : 5, Math.round((cnt[i] / max) * 100))}%"></i><small>${d.toLocaleDateString(locale, { weekday: 'short' })}</small></div>`).join('');

  // по упражнениям
  const byEx = Object.keys(names).map((n) => {
    const e = s.ex[n];
    return `<div class="ex-row"><b>${names[n]}</b><div class="bar"><i style="width:${Math.round((e.count / s.workouts) * 100)}%"></i></div>` +
      `<small>${e.count}${e.best ? ` · ${t('record')} ${n === 'plank' ? fmt(e.best) : e.best}` : ''}</small></div>`;
  }).join('');

  box.innerHTML = `<div class="kpis">${kpis}</div><div class="dash-grid">` +
    `<div><h3 class="dash-h">${t('trend')}</h3>${trend}</div>` +
    `<div><h3 class="dash-h">${t('last7')}</h3><div class="week">${bars}</div></div>` +
    `<div><h3 class="dash-h">${t('byExercise')}</h3>${byEx}</div>${badgeBlock}</div>`;
}

export function renderHistory(list) {
  histCache = list;
  renderDashboard(list);
  const s = calcStats(list);
  const names = { squat: t('squat'), pushup: t('pushup'), plank: t('plank') };
  const locale = dateLocale();
  const stats = $('stats');
  if (stats) {
    stats.textContent = list.length
      ? `${t('statsWorkouts')}: ${s.workouts} · ${t('statsBest')}: ${s.bestTech}% · ${t('statsReps')}: ${s.reps} · ${t('streak')}: ${s.streak} ${t('days')}`
      : '';
  }
  const hist = $('history');
  if (!hist) return;
  hist.innerHTML = list.length
    ? list.slice(0, 10).map((r) => {
        const d = new Date(r.date);
        const when = d.toLocaleDateString(locale, { day: '2-digit', month: '2-digit' }) + ' ' +
          d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
        const res = r.exercise === 'plank' ? fmt(r.holdSeconds) : '×' + r.reps;
        return `<li><span>${when}</span><b>${names[r.exercise] || r.exercise} ${res}${r.goalReached ? ' ✓' : ''}</b><em>${r.technique}%</em></li>`;
      }).join('')
    : `<li class="empty">${t('emptyHistory')}</li>`;
}

// ——— Welcome content ———
export function renderWelcomeContent() {
  if ($('welcomeAbout')) $('welcomeAbout').textContent = t('defaultAbout');
  if ($('welcomeMission')) $('welcomeMission').textContent = t('defaultMission');
  if ($('welcomeFeatures')) {
    $('welcomeFeatures').innerHTML = t('defaultFeatures').split('\n').filter(Boolean)
      .map((l) => `<li>${l.replace(/^[•\-*]\s*/, '')}</li>`).join('');
  }
}

export function showWelcome() {
  $('welcome') && ($('welcome').hidden = false);
  $('mainApp') && ($('mainApp').hidden = true);
  document.body.classList.add('on-welcome');
  window.scrollTo(0, 0);
  requestAnimationFrame(syncWelcomeTabs);
}

export function hideWelcome() {
  $('welcome') && ($('welcome').hidden = true);
  $('mainApp') && ($('mainApp').hidden = false);
  document.body.classList.remove('on-welcome');
  window.scrollTo(0, 0);
}

// ——— Accessibility helpers (presentation only, no training logic) ———
let lastFocused = null;

function canTakeFocus(el) {
  return !!el && el.isConnected !== false && !el.disabled && !el.hidden
    && !(el.closest && el.closest('[hidden]')) && el.offsetParent !== null && typeof el.focus === 'function';
}

function syncWelcomeTabs() {
  const tabs = Array.from(document.querySelectorAll('.welcome-tab'));
  if (!tabs.length) return;
  let activeTab = null;
  tabs.forEach((tab) => {
    const active = tab.classList.contains('active');
    tab.setAttribute('aria-selected', active ? 'true' : 'false');
    tab.tabIndex = active ? 0 : -1;
    if (active) activeTab = tab;
  });
  // Sliding indicator (vanilla adaptation of BuildUI Animated Tabs "bubble"):
  // position follows the active tab; CSS transition provides the motion.
  const ink = document.querySelector('.welcome-tabs .tab-ink');
  if (ink && activeTab) {
    ink.style.transform = `translateX(${activeTab.offsetLeft}px)`;
    ink.style.width = `${activeTab.offsetWidth}px`;
  }
}

// Set both visible labels of the animated CTA (vanilla adaptation of
// dillionverma Interactive Hover Button); falls back to plain text.
function setCtaLabels(btn, text) {
  const labels = btn.querySelectorAll('.btn-cta-label');
  if (labels.length) labels.forEach((s) => { s.textContent = text; });
  else btn.textContent = text;
}

// Split a headline into animated word spans (vanilla adaptation of MagicUI
// Text Animate "by word" + "slideUp"): full text stays on aria-label so
// screen readers hear it once; spans are decorative.
function splitWords(el) {
  const text = el.textContent || '';
  el.setAttribute('aria-label', text);
  el.textContent = '';
  text.split(/\s+/).filter(Boolean).forEach((word, i) => {
    if (i > 0) el.appendChild(document.createTextNode(' '));
    const s = document.createElement('span');
    s.className = 'w';
    s.setAttribute('aria-hidden', 'true');
    s.style.setProperty('--i', i);
    s.textContent = word;
    el.appendChild(s);
  });
}

function initWelcomeTabsA11y() {
  const tabs = Array.from(document.querySelectorAll('.welcome-tab'));
  if (!tabs.length || !window.MutationObserver) { syncWelcomeTabs(); return; }
  syncWelcomeTabs();
  const obs = new MutationObserver(syncWelcomeTabs);
  tabs.forEach((tab) => obs.observe(tab, { attributes: true, attributeFilter: ['class'] }));
  window.addEventListener('resize', syncWelcomeTabs, { passive: true });
  if (document.fonts?.ready) document.fonts.ready.then(() => syncWelcomeTabs()).catch(() => {});
  document.querySelector('.welcome-tabs')?.addEventListener('keydown', (e) => {
    const current = document.activeElement;
    const i = tabs.indexOf(current);
    if (i < 0) return;
    let next = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = tabs[(i + 1) % tabs.length];
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = tabs[(i - 1 + tabs.length) % tabs.length];
    else if (e.key === 'Home') next = tabs[0];
    else if (e.key === 'End') next = tabs[tabs.length - 1];
    if (next) { e.preventDefault(); next.focus(); next.click(); }
  });
}

function initResultDialogA11y() {
  const overlay = document.getElementById('result');
  if (!overlay) return;
  overlay.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || overlay.hidden) return;
    const items = Array.from(overlay.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
      .filter((el) => !el.disabled && el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
}

try { initWelcomeTabsA11y(); } catch {}
try { initResultDialogA11y(); } catch {}
