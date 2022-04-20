const width = 1500;
const height = 1500;

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

console.log(canvas, ctx);

canvas.width = width;
canvas.height = height;

let soundAnalyser: AnalyserNode;
let bufferLength: number;

const HSLToRGB = (h: number, s: number, l: number): number[] => {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const k = n => (n + h / 30) % 12;
  const f = n =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [255 * f(0), 255 * f(8), 255 * f(4)];
};

async function getAudio() {
  const stream = await navigator.mediaDevices
    .getUserMedia ({ audio: true });

  const audioCtx = new AudioContext();
  soundAnalyser = audioCtx.createAnalyser();
  const source = audioCtx.createMediaStreamSource(stream); // Typescript problem here
  source.connect(soundAnalyser);

  soundAnalyser.fftSize = 2 ** 10;
  bufferLength = soundAnalyser.frequencyBinCount;

  const timeData = new Uint8Array(soundAnalyser.frequencyBinCount);
  const frequenceData = new Uint8Array(soundAnalyser.frequencyBinCount);

  drawTimeData(timeData);
  drawFrequency(frequenceData);
}

const drawTimeData = (timeData: Uint8Array) => {
  console.log(timeData);  
  soundAnalyser.getByteTimeDomainData(timeData);

  ctx.clearRect(0, 0, width, height);
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#ffc600'; // Yellow
  ctx.beginPath();

  const sliceWidth = width / bufferLength;
  let x = 0;

  timeData.forEach((data, i) => {
    const z = data / 128;
    const y = (z * height) / 2;

    if (i === 0) {
      ctx.moveTo(x, y);
    }
    else {
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
    const [h, s, l] = [360 / (percent * 360) - 0.5, 0.8, 0.5];
    const barHeight = height * percent * 0.5;
    const [r, g, b] = HSLToRGB(h, s, l);

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