// Картинка-итог для шаринга: рисуем на canvas → Web Share API (телефон) или скачивание PNG.
const G = '#c8f04b', INK = '#161a08', TEXT = '#f4efe1', MUTED = '#b3ac93', LINE = '#2a3024';

function rr(x, px, py, w, h, r) {
  x.beginPath();
  x.roundRect ? x.roundRect(px, py, w, h, r) : x.rect(px, py, w, h);
}

// подбирает размер шрифта, чтобы текст влез в maxW
function fit(x, text, weight, maxPx, maxW, family) {
  let px = maxPx;
  do { x.font = `${weight} ${px}px ${family}`; px -= 2; } while (x.measureText(text).width > maxW && px > 14);
}

// d: { subtitle, title, big, bigLabel, stats: [[label, value]], note, footer }
export async function shareCard(d) {
  const W = 1080, H = 1350;
  const c = Object.assign(document.createElement('canvas'), { width: W, height: H });
  const x = c.getContext('2d');
  const DISPLAY = 'Unbounded, system-ui, sans-serif', BODY = 'Manrope, system-ui, sans-serif';
  try { await Promise.all([document.fonts.load('800 100px Unbounded'), document.fonts.load('600 40px Unbounded'), document.fonts.load('700 30px Manrope')]); } catch {}

  x.fillStyle = '#101311'; x.fillRect(0, 0, W, H);
  const glow = x.createRadialGradient(W * 0.85, 0, 40, W * 0.85, 0, 950);
  glow.addColorStop(0, 'rgba(200,240,75,0.24)'); glow.addColorStop(1, 'rgba(200,240,75,0)');
  x.fillStyle = glow; x.fillRect(0, 0, W, H);
  x.strokeStyle = LINE; x.lineWidth = 2; rr(x, 40, 40, W - 80, H - 80, 40); x.stroke();

  // логотип
  x.fillStyle = G; rr(x, 90, 90, 84, 84, 24); x.fill();
  x.fillStyle = INK; x.font = `800 48px ${DISPLAY}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('C', 132, 134);
  x.textAlign = 'left'; x.fillStyle = TEXT; x.font = `800 42px ${DISPLAY}`; x.fillText('Cali.app', 200, 118);
  x.fillStyle = MUTED; x.font = `600 27px ${BODY}`; x.fillText(d.subtitle, 202, 160);

  // упражнение и главная цифра
  x.textBaseline = 'alphabetic';
  x.fillStyle = G; x.font = `600 40px ${DISPLAY}`; x.fillText(d.title.toUpperCase(), 90, 430);
  x.fillStyle = TEXT; fit(x, d.big, 800, 300, W - 180, DISPLAY); x.fillText(d.big, 86, 690);
  x.fillStyle = MUTED; x.font = `700 32px ${BODY}`; x.fillText(d.bigLabel.toUpperCase(), 92, 752);

  // плитки со статистикой
  const n = d.stats.length, gap = 24, cw = (W - 180 - gap * (n - 1)) / n;
  d.stats.forEach(([label, value], i) => {
    const px = 90 + i * (cw + gap);
    x.fillStyle = '#0b0d0b'; rr(x, px, 830, cw, 190, 28); x.fill();
    x.strokeStyle = LINE; x.lineWidth = 2; rr(x, px, 830, cw, 190, 28); x.stroke();
    x.fillStyle = MUTED; fit(x, label.toUpperCase(), 700, 24, cw - 40, BODY); x.fillText(label.toUpperCase(), px + 24, 880);
    x.fillStyle = TEXT; fit(x, value, 800, 56, cw - 40, DISPLAY); x.fillText(value, px + 24, 968);
  });

  // рекорд / достижение
  if (d.note) {
    x.font = `700 32px ${BODY}`;
    const w = Math.min(W - 180, x.measureText(d.note).width + 64);
    x.fillStyle = 'rgba(200,240,75,0.12)'; rr(x, 90, 1066, w, 84, 42); x.fill();
    x.strokeStyle = G; x.lineWidth = 2; rr(x, 90, 1066, w, 84, 42); x.stroke();
    x.fillStyle = G; x.textBaseline = 'middle'; x.fillText(d.note, 122, 1109, W - 244); x.textBaseline = 'alphabetic';
  }

  x.fillStyle = MUTED; x.font = `600 28px ${BODY}`; x.fillText(d.footer, 90, 1242);
  x.textAlign = 'right'; x.fillStyle = G; x.fillText('cali.app', W - 90, 1242);

  const blob = await new Promise((res) => c.toBlob(res, 'image/png'));
  const file = new File([blob], 'cali-result.png', { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: 'Cali.app' }); return 'shared'; }
    catch (e) { if (e.name === 'AbortError') return 'cancel'; }
  }
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'cali-result.png' });
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  return 'saved';
}
