import { hslToRgb } from './utils.js';

const width = 1500;
const height = 1500;

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = width;
canvas.height = height;

let soundAnalyser: AnalyserNode;
let bufferLength: number;

let stopTimeData = false;
let stopFrequency = false;

async function getAudio() {
  const stream = await navigator.mediaDevices
    .getUserMedia({ audio: true });

  const audioCtx = new AudioContext();
  soundAnalyser = audioCtx.createAnalyser();
  const source = audioCtx.createMediaStreamSource(stream);
  source.connect(soundAnalyser);

  soundAnalyser.fftSize = 2 ** 10;
  bufferLength = soundAnalyser.frequencyBinCount;

  const timeData = new Uint8Array(soundAnalyser.frequencyBinCount);
  const frequenceData = new Uint8Array(soundAnalyser.frequencyBinCount);

  drawTimeData(timeData);
  drawFrequency(frequenceData);
}

const limit = (min: number, max: number, value: number) => {
  return Math.max(min, Math.min(max, value));
};

let timeColor = '#00ffff';

const timeColors = [
  '#00ff00',
  '#ff0000',
  '#ffffff',
  '#0000ff',
  '#00ffff',
  '#ffff00',
];

const drawTimeData = (timeData: Uint8Array) => {
  if (stopTimeData) { 
    ctx.clearRect(0, 0, width, height);
    return; 
  }

  soundAnalyser.getByteTimeDomainData(timeData);

  ctx.clearRect(0, 0, width, height);
  ctx.lineWidth = 8;
  ctx.strokeStyle = timeColor;
  ctx.shadowBlur = 13;
  ctx.shadowColor = 'black';
  ctx.beginPath();
  
  const sliceWidth = width / bufferLength;
  let x = 0;

  timeData.forEach((data, i) => {
    if (i % 8 === 0) {
      return;
    }

    const z = data / 130;
    let y = (z * height) / 2;
    y = limit(400, height - 400, y);

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    
    x += sliceWidth;
  });

  ctx.stroke();

  requestAnimationFrame(() => {
    drawTimeData(timeData);
  });
};

let barColorFunc = (r: number, g: number, b: number) => {
  return [r, g, b];
};

const barColorFuncs = [
  (r: number, g: number, b: number) => {
    return [r, g, 0];
  },
  (r: number, g: number, b: number) => {
    r = g = b = Math.max(r, g, b);
    return [r, g, b];
  },
  (r: number, g: number, b: number) => {
    r = g = Math.max(r, g, b);
    return [r, g, 0];
  }
];

const drawFrequency = (frequencyData: Uint8Array) => {
  if (stopFrequency) { return; }

  soundAnalyser.getByteFrequencyData(frequencyData);
  const barWidth = (width / bufferLength) * 2.3;
  let x = 0;

  if (stopTimeData) {
    ctx.clearRect(0, 0, width, height);
  }

  const percentageIncrease = 0.4;

  frequencyData.slice(0, 20);
  frequencyData.forEach((amount, i) => {
    if (i % 3 !== 0 || i === 0) {
      return;
    }

    const percent = amount / 255;
    let barHeight = height * percent * (percentageIncrease + ((i - 13) * 0.0009));
    barHeight = limit(0, height - 200, barHeight);

    const [h, s, l] = [360 / (percent * 500) - 0.5, 0.8, 0.5];
    let [r, g, b] = hslToRgb(h, s, l);
    [r, g, b] = barColorFunc(r, g, b);

    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(x, height - barHeight, barWidth, barHeight);

    x += barWidth + 2;
  });

  requestAnimationFrame(() => {
    drawFrequency(frequencyData);
  });
};


(() => {
  getAudio();
})();

let intoImage = document.getElementById('intro-image');
let theSelect = document.getElementById('select-logo');

document.onkeydown = (event) => {
  switch (event.key) {
    case "'":
      timeColor = timeColors[(timeColors.indexOf(timeColor) + 1) % timeColors.length];
      break;
    case ' ':
      stopTimeData = !stopTimeData;
      stopFrequency = !stopFrequency;
      getAudio();
      break;
    case ',':
      timeColor = '#00ffff';
      break;
    case '.':
      barColorFunc = barColorFuncs[(barColorFuncs.indexOf(barColorFunc) + 1) % barColorFuncs.length];
      break;
    case 'p':
      barColorFunc = (r: number, g: number, b: number) => {
        return [r, g, b];
      }
      break;
    case 'a':
      stopTimeData = !stopTimeData;
      getAudio();
      break;
    case 'o':
      stopFrequency = !stopFrequency;
      getAudio();
      break;
    case ';':
      intoImage.classList.toggle('hidden');
      break;
    case 'q':
      theSelect.classList.toggle('hidden');
      break;
  }
};