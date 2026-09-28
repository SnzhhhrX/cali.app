// Языковые строки RU / EN + переключатель
const STRINGS = {
  ru: {
    // Header / nav
    tagline: 'AI Fitness Assistant',
    startApp: 'Начать тренировку',
    about: 'О проекте',
    mission: 'Миссия',
    features: 'Возможности',
    language: 'Язык',
    editContent: 'Редактировать текст',
    save: 'Сохранить',
    cancel: 'Отмена',
    back: 'Назад',
    close: 'Закрыть',

    // Welcome defaults
    welcomeTitle: 'Cali.app',
    welcomeSubtitle: 'Твой AI-тренер в браузере',
    defaultAbout: 'Cali.app — это AI-ассистент для калистеники и силовых упражнений. Камера видит твоё тело, ИИ находит суставы, а приложение считает повторения и подсказывает, что исправить. Видео не покидает устройство — всё работает локально в браузере.',
    defaultMission: 'Сделать тренировки без тренера безопаснее и эффективнее. Каждый должен понимать, правильно ли он выполняет упражнение, без дорогого оборудования и регистрации.',
    defaultFeatures: '• Real-time распознавание позы через веб-камеру\n• 3 упражнения: Присед, Отжимания, Планка\n• Конкретные подсказки по технике (Error Mode)\n• Защита от фейков при низкой видимости\n• История тренировок на устройстве\n• Голосовые подсказки и звуки\n• Работает как PWA на телефоне',

    // Controls
    exercise: 'Упражнение',
    squat: 'Присед',
    pushup: 'Отжимания',
    plank: 'Планка',
    voiceSound: 'Голос и звук',
    startWorkout: 'Начать тренировку',
    finishWorkout: 'Завершить',
    newWorkout: 'Новая тренировка',
    workoutComplete: 'Тренировка завершена',

    // Cards
    exerciseCard: 'Упражнение',
    reps: 'Повторы',
    time: 'Время',
    technique: 'Техника',
    state: 'Состояние',
    feedback: 'Обратная связь',
    tipsTitle: 'Как встать и что проверить',
    howItWorks: 'Как это работает',
    howItWorksText: 'Камера видит тело, ИИ находит суставы, а Cali.app считает углы, повторения и находит ошибки техники. Видео не покидает устройство: всё работает в браузере.',
    history: 'История тренировок',
    clear: 'Очистить',
    emptyHistory: 'Пока пусто. Сделай первую тренировку!',
    statsWorkouts: 'Тренировок',
    statsBest: 'Лучшая техника',
    statsReps: 'Всего повторений',

    // Camera / HUD
    flipCamera: 'Сменить камеру',
    fullscreen: 'На весь экран',
    exitFullscreen: 'Выйти',
    visibility: 'Видимость',
    pressStart: 'Нажми «Начать тренировку»',
    requestingCamera: 'Запрашиваем камеру…',
    loadingModel: 'Загружаем модель (несколько секунд)…',
    startIn: 'Старт через',
    standInFrame: 'Встань в кадр',
    personNotFound: 'Человек не найден в кадре',
    bodyNotVisible: 'Встань так, чтобы тело было видно целиком',
    takePosition: 'Прими позицию: тело горизонтально, камера сбоку',
    goodForm: 'Отлично, техника хорошая!',
    techniqueGood: 'ХОРОШО',
    techniqueFix: 'ИСПРАВЬ',

    // Result
    techniqueLabel: 'Техника',
    duration: 'Длительность',
    plankHold: 'Удержание планки',

    // Errors (keys used in errorMode)
    err_deeper: 'Сядь немного глубже',
    err_torso: 'Выпрями корпус',
    err_knee: 'Стабилизируй колено',
    err_chest: 'Опусти грудь ниже',
    err_hip_down: 'Опусти таз',
    err_hip_up: 'Подними таз немного выше',

    // Advice
    advice_deeper: 'Приседай ниже — до параллели бёдер с полом.',
    advice_torso: 'Держи грудь вперёд и спину ровной.',
    advice_knee: 'Разводи колени в стороны носков.',
    advice_chest: 'Опускайся, пока локти не достигнут ~90°.',
    advice_hip_down: 'Напряги пресс и ягодицы, не поднимай таз.',
    advice_hip_up: 'Подтяни живот, не проваливай поясницу.',

    // Summary
    summary_excellent: 'Отличная техника!',
    summary_ok: 'Неплохо, есть что улучшить.',
    summary_attention: 'Техника требует внимания.',
    summary_no_errors: 'Ошибок не найдено — так держать.',
    summary_often: 'Чаще всего',
    summary_tip: 'Совет',

    // Tips
    tips_squat_setup: 'Встань боком к камере в полный рост, стопы на ширине плеч.',
    tips_squat_1: 'Приседай, пока бёдра не станут почти параллельны полу',
    tips_squat_2: 'Спина ровная, грудь вперёд',
    tips_squat_3: 'Колени смотрят в сторону носков',
    tips_pushup_setup: 'Поставь телефон сбоку на уровне пола, чтобы тело было видно целиком.',
    tips_pushup_1: 'Тело — прямая линия от плеч до пяток',
    tips_pushup_2: 'Опускайся, пока локти не согнутся до ~90°',
    tips_pushup_3: 'Полностью выпрямляй руки вверху',
    tips_plank_setup: 'Камера сбоку, тело целиком в кадре. Таймер идёт, пока ты в позиции.',
    tips_plank_1: 'Локти под плечами',
    tips_plank_2: 'Не прогибай поясницу и не задирай таз',
    tips_plank_3: 'Дыши ровно, смотри в пол',

    // Camera errors
    cam_unavailable: 'Камера недоступна. Открой сайт по https или через localhost.',
    cam_denied: 'Доступ к камере запрещён. Разреши камеру в настройках браузера.',
    cam_not_found: 'Камера не найдена.',
    cam_failed: 'Не удалось запустить камеру',

    // Edit modal
    editTitle: 'Редактировать контент приветствия',
    editAbout: 'О проекте',
    editMission: 'Миссия',
    editFeatures: 'Возможности (каждая строка — пункт)',
    editSaved: 'Сохранено!',
    resetDefaults: 'Сбросить по умолчанию',
  },
  en: {
    tagline: 'AI Fitness Assistant',
    startApp: 'Start Workout',
    about: 'About',
    mission: 'Mission',
    features: 'Features',
    language: 'Language',
    editContent: 'Edit content',
    save: 'Save',
    cancel: 'Cancel',
    back: 'Back',
    close: 'Close',

    welcomeTitle: 'Cali.app',
    welcomeSubtitle: 'Your AI trainer in the browser',
    defaultAbout: 'Cali.app is an AI assistant for calisthenics and strength exercises. The camera sees your body, AI finds joints, and the app counts reps and tells you what to fix. Video never leaves the device — everything runs locally in the browser.',
    defaultMission: 'Make training without a coach safer and more effective. Everyone should know if they are doing an exercise correctly — without expensive gear or registration.',
    defaultFeatures: '• Real-time pose recognition via webcam\n• 3 exercises: Squat, Push-up, Plank\n• Specific technique tips (Error Mode)\n• Fake-rep protection on low visibility\n• Workout history on device\n• Voice cues and sounds\n• Works as PWA on phone',

    exercise: 'Exercise',
    squat: 'Squat',
    pushup: 'Push-up',
    plank: 'Plank',
    voiceSound: 'Voice & sound',
    startWorkout: 'Start Workout',
    finishWorkout: 'Finish',
    newWorkout: 'New Workout',
    workoutComplete: 'Workout Complete',

    exerciseCard: 'Exercise',
    reps: 'Reps',
    time: 'Time',
    technique: 'Technique',
    state: 'State',
    feedback: 'Feedback',
    tipsTitle: 'How to set up & what to check',
    howItWorks: 'How it works',
    howItWorksText: 'The camera sees the body, AI finds joints, and Cali.app calculates angles, counts reps and detects technique errors. Video never leaves the device: everything runs in the browser.',
    history: 'Workout history',
    clear: 'Clear',
    emptyHistory: 'Empty so far. Do your first workout!',
    statsWorkouts: 'Workouts',
    statsBest: 'Best technique',
    statsReps: 'Total reps',

    flipCamera: 'Flip camera',
    fullscreen: 'Fullscreen',
    exitFullscreen: 'Exit',
    visibility: 'Visibility',
    pressStart: 'Press “Start Workout”',
    requestingCamera: 'Requesting camera…',
    loadingModel: 'Loading model (a few seconds)…',
    startIn: 'Starting in',
    standInFrame: 'Step into the frame',
    personNotFound: 'No person detected in frame',
    bodyNotVisible: 'Stand so your whole body is visible',
    takePosition: 'Get into position: body horizontal, camera from the side',
    goodForm: 'Great form!',
    techniqueGood: 'GOOD',
    techniqueFix: 'FIX IT',

    techniqueLabel: 'Technique',
    duration: 'Duration',
    plankHold: 'Plank hold',

    err_deeper: 'Go a bit deeper',
    err_torso: 'Keep your torso upright',
    err_knee: 'Stabilize your knee',
    err_chest: 'Lower your chest more',
    err_hip_down: 'Lower your hips',
    err_hip_up: 'Raise your hips a bit',

    advice_deeper: 'Squat lower — until thighs are parallel to the floor.',
    advice_torso: 'Chest forward, back straight.',
    advice_knee: 'Push knees out toward your toes.',
    advice_chest: 'Go down until elbows reach ~90°.',
    advice_hip_down: 'Brace core and glutes, don’t pike up.',
    advice_hip_up: 'Pull belly in, don’t sag the lower back.',

    summary_excellent: 'Excellent technique!',
    summary_ok: 'Not bad, room to improve.',
    summary_attention: 'Technique needs attention.',
    summary_no_errors: 'No errors found — keep it up.',
    summary_often: 'Most often',
    summary_tip: 'Tip',

    tips_squat_setup: 'Stand sideways to the camera, full body, feet shoulder-width apart.',
    tips_squat_1: 'Squat until thighs are nearly parallel to the floor',
    tips_squat_2: 'Back straight, chest forward',
    tips_squat_3: 'Knees track over toes',
    tips_pushup_setup: 'Place the phone sideways at floor level so the whole body is visible.',
    tips_pushup_1: 'Body is a straight line from shoulders to heels',
    tips_pushup_2: 'Lower until elbows bend to ~90°',
    tips_pushup_3: 'Fully extend arms at the top',
    tips_plank_setup: 'Camera from the side, whole body in frame. Timer runs while you hold the position.',
    tips_plank_1: 'Elbows under shoulders',
    tips_plank_2: 'Don’t sag or pike the hips',
    tips_plank_3: 'Breathe evenly, look at the floor',

    cam_unavailable: 'Camera unavailable. Open the site over https or localhost.',
    cam_denied: 'Camera access denied. Allow the camera in browser settings.',
    cam_not_found: 'Camera not found.',
    cam_failed: 'Failed to start camera',

    editTitle: 'Edit welcome content',
    editAbout: 'About the project',
    editMission: 'Mission',
    editFeatures: 'Features (one item per line)',
    editSaved: 'Saved!',
    resetDefaults: 'Reset to defaults',
  },
};

const LANG_KEY = 'cali_lang';
let current = localStorage.getItem(LANG_KEY) || (navigator.language?.startsWith('ru') ? 'ru' : 'en');

export function getLang() {
  return current;
}

export function setLang(lang) {
  if (!STRINGS[lang]) return;
  current = lang;
  localStorage.setItem(LANG_KEY, lang);
  document.documentElement.lang = lang;
}

export function t(key) {
  return STRINGS[current][key] ?? STRINGS.en[key] ?? key;
}

export function tError(key) {
  return t(key);
}

export const ERROR_KEYS = {
  'Сядь немного глубже': 'err_deeper',
  'Выпрями корпус': 'err_torso',
  'Стабилизируй колено': 'err_knee',
  'Опусти грудь ниже': 'err_chest',
  'Опусти таз': 'err_hip_down',
  'Подними таз немного выше': 'err_hip_up',
  // EN originals if ever stored
  'Go a bit deeper': 'err_deeper',
  'Keep your torso upright': 'err_torso',
  'Stabilize your knee': 'err_knee',
  'Lower your chest more': 'err_chest',
  'Lower your hips': 'err_hip_down',
  'Raise your hips a bit': 'err_hip_up',
};

export function translateError(text) {
  const key = ERROR_KEYS[text];
  return key ? t(key) : text;
}

export function speechLang() {
  return current === 'ru' ? 'ru-RU' : 'en-US';
}
