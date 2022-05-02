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

  soundAnalyser.fftSize = 2 ** 14;
  bufferLength = soundAnalyser.frequencyBinCount;

  const timeData = new Uint8Array(soundAnalyser.frequencyBinCount);
  const frequenceData = new Uint8Array(soundAnalyser.frequencyBinCount);

  drawTimeData(timeData);
  drawFrequency(frequenceData);
}

const drawTimeData = (timeData: Uint8Array) => {
  soundAnalyser.getByteTimeDomainData(timeData);

  ctx.clearRect(0, 0, width, height);
  ctx.lineWidth = 5;
  ctx.strokeStyle = 'rgb(0, 0, 255)';
  ctx.shadowBlur = 8;
  ctx.shadowColor = 'grey';
  ctx.beginPath();
  
  const sliceWidth = width / bufferLength;
  let x = 0;

  timeData.forEach((data, i) => {
    const z = data / 128;
    let y = (z * height) / 2;

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

  frequencyData.forEach((amount) => {
    const percent = amount / 255;
    const barHeight = height * percent * 0.4;

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