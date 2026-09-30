// Error Mode: метрики → ключи ошибок (перевод через i18n)
import { T } from '../utils/thresholds.js';

const bodyLineErrors = (m) =>
  m.bodyAngle != null && m.bodyAngle < T.BODY_LINE_MIN_ANGLE
    ? [m.hipHeight > 0.025 ? 'Опусти таз' : 'Подними таз немного выше']
    : [];

export function analyze(name, r) {
  const m = r.metrics, errors = [];
  if (name === 'squat' && r.state === 'DOWN') {
    if (m.torsoAngle < T.SQUAT_TORSO_MIN) errors.push('Выпрями корпус');
    if (m.kneeRatio < T.SQUAT_KNEE_RATIO_MIN) errors.push('Стабилизируй колено');
    if (m.angle > T.SQUAT_DOWN_ANGLE && m.minAngle > T.SQUAT_GOOD_DEPTH) errors.push('Сядь немного глубже');
  }
  if (name === 'pushup') {
    errors.push(...bodyLineErrors(m));
    if (r.state === 'DOWN' && m.angle > T.PUSHUP_DOWN_ANGLE && m.minAngle > T.PUSHUP_GOOD_DEPTH) errors.push('Опусти грудь ниже');
  }
  if (name === 'plank') errors.push(...bodyLineErrors(m));
  return errors;
}
