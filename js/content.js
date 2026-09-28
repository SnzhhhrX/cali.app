// Советы и резюме — через i18n
import { t, translateError } from './i18n.js';

export function getTips(name) {
  return {
    setup: t(`tips_${name}_setup`),
    points: [t(`tips_${name}_1`), t(`tips_${name}_2`), t(`tips_${name}_3`)],
  };
}

const ADVICE_KEYS = {
  err_deeper: 'advice_deeper',
  err_torso: 'advice_torso',
  err_knee: 'advice_knee',
  err_chest: 'advice_chest',
  err_hip_down: 'advice_hip_down',
  err_hip_up: 'advice_hip_up',
};

export function summary(r) {
  const head =
    r.technique >= 85 ? t('summary_excellent') :
    r.technique >= 60 ? t('summary_ok') :
    t('summary_attention');
  if (!r.topError) return head + ' ' + t('summary_no_errors');
  const errText = translateError(r.topError);
  // map original RU/EN error to advice key
  const key = Object.entries({
    'Сядь немного глубже': 'advice_deeper',
    'Выпрями корпус': 'advice_torso',
    'Стабилизируй колено': 'advice_knee',
    'Опусти грудь ниже': 'advice_chest',
    'Опусти таз': 'advice_hip_down',
    'Подними таз немного выше': 'advice_hip_up',
    'Go a bit deeper': 'advice_deeper',
    'Keep your torso upright': 'advice_torso',
    'Stabilize your knee': 'advice_knee',
    'Lower your chest more': 'advice_chest',
    'Lower your hips': 'advice_hip_down',
    'Raise your hips a bit': 'advice_hip_up',
  })[r.topError] || null;
  const advice = key ? t(key) : (ADVICE_KEYS[r.topError] ? t(ADVICE_KEYS[r.topError]) : '');
  return `${head} ${t('summary_often')}: «${errText}». ${t('summary_tip')}: ${advice || '—'}`;
}
