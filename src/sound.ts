// import { hslToRgb } from './utils.js';

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

  soundAnalyser.fftSize = 2 ** 13;
  bufferLength = soundAnalyser.frequencyBinCount;

  const timeData = new Uint8Array(soundAnalyser.frequencyBinCount);
  const frequenceData = new Uint8Array(soundAnalyser.frequencyBinCount);

  drawTimeData(timeData);
  drawFrequency(frequenceData);
}

const limit = (min: number, max: number, value: number) => {
  return Math.max(min, Math.min(max, value));
};

const drawTimeData = (timeData: Uint8Array) => {
  soundAnalyser.getByteTimeDomainData(timeData);

  ctx.clearRect(0, 0, width, height);
  ctx.lineWidth = 4.5;
  ctx.strokeStyle = 'rgb(0, 0, 255)';
  ctx.shadowBlur = 8;
  ctx.shadowColor = 'grey';
  ctx.beginPath();
  
  const sliceWidth = width / bufferLength;
  let x = 0;

  timeData.forEach((data, i) => {
    if (i % 6 === 0) {
      return;
    }

    const z = data / 128;
    let y = (z * height) / 2;
    y = limit(300, height - 300, y);

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
  const barWidth = (width / bufferLength) * 2.5;
  let x = 0;

  frequencyData.forEach((amount, i) => {
    if (i % 3 !== 0 || i === 0) {
      return;
    }

    const percent = amount / 255;
    let barHeight = height * percent * 0.6;
    barHeight = limit(0, height - 200, barHeight);

    ctx.fillStyle = 'rgb(200, 200, 200)';
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