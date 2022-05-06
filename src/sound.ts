import { hslToRgb } from './utils.js';

const width = 1500;
const height = 1500;

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = width;
canvas.height = height;

let soundAnalyser: AnalyserNode;
let bufferLength: number;

async function getAudio() {
  const stream = await navigator.mediaDevices
    .getUserMedia({ audio: true });

  const audioCtx = new AudioContext();
  soundAnalyser = audioCtx.createAnalyser();
  const source = audioCtx.createMediaStreamSource(stream);
  source.connect(soundAnalyser);

  soundAnalyser.fftSize = 2 ** 11;
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

const switchTimeColor = () => {
  // cycle rgb hex colors
  const colors = [
    '#ff0000',
    '#ff7f00',
    '#ffff00',
    '#00ff00',
    '#00ffff',
    '#0000ff',
    '#7f00ff',
    '#ff00ff',
  ];

  timeColor = colors[Math.floor(Math.random() * colors.length)];
};

const drawTimeData = (timeData: Uint8Array) => {
  soundAnalyser.getByteTimeDomainData(timeData);

  ctx.clearRect(0, 0, width, height);
  ctx.lineWidth = 5;
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

const drawFrequency = (frequencyData: Uint8Array) => {
  soundAnalyser.getByteFrequencyData(frequencyData);
  const barWidth = (width / bufferLength) * 2.3;
  let x = 0;

  frequencyData.forEach((amount, i) => {
    if (i % 3 !== 0 || i === 0) {
      return;
    }

    const percent = amount / 255;
    let barHeight = height * percent * 0.4;
    barHeight = limit(0, height - 200, barHeight);

    const [h, s, l] = [360 / (percent * 500) - 0.5, 0.8, 0.5];
    const [r, g, b] = hslToRgb(h, s, l);
    // TODO
    // let avg = ((r + b) / 2) * 1.5;

    // if (avg < 128) {
    //   avg = 0;
    // }

    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    // TODO
    ctx.fillRect(x, 0, barWidth, barHeight);
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

document.onkeydown = (event) => {
  switch (event.key) {
    case "'":
      switchTimeColor();
      break;
  }
};