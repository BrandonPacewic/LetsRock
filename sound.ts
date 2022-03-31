const width = 1500;
const height = 1500;

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = width;
canvas.height = height;

let soundAnalyser: AnalyserNode;

async function getAudio() {
  const stream = await navigator.mediaDevices
    .getUserMedia ({ audio: true });

  const audioCtx = new AudioContext();
  soundAnalyser = audioCtx.createAnalyser();
  const source = audioCtx.createMediaStreamSource(stream); // Typescript problem here
  source.connect(soundAnalyser);

  soundAnalyser.fftSize = 2 ** 10;

  const timeData = new Uint8Array(soundAnalyser.frequencyBinCount);
  const frequenceData = new Uint8Array(soundAnalyser.frequencyBinCount);

  drawTimeData(timeData);
}

const drawTimeData = (timeData: Uint8Array) => {
  console.log(timeData);  
  soundAnalyser.getByteTimeDomainData(timeData);

  ctx.lineWidth = 10;
  ctx.strokeStyle = '#ffc600';
  ctx.beginPath();

  requestAnimationFrame(() => {
    drawTimeData(timeData);
  });
};

(() => {
  getAudio();
})();