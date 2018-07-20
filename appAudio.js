var ctxAudio, analyser, source;
var myAudio = document.querySelector('audio');
var canvas = document.querySelector('canvas');
var canvasCtx = canvas.getContext("2d");

var isPlaying = false;

let WIDTH = window.innerHeight - 100;
let HEIGHT = WIDTH;
canvas.width = WIDTH;
canvas.height = WIDTH;
let MARGIN = WIDTH / 8;
const RATIO = 1.75;
let LONGUEUR = (WIDTH / RATIO) - (RATIO * MARGIN);

const BLACK_COLOR = "rgb(0,0,0)";
const WHITE_COLOR = "rgb(255, 240, 209)";
const YELLOW_COLOR = "rgb(255, 215, 132)";

const START_POS = -Math.PI / 2;
const SLOW_FACTOR = [0.22, 0.227, 0.232, 0.244, 0.251, 0.257, 0.260, 0.263];

let pos = [];
let FTT_SIZE;
let dataArray;

if (HEIGHT > 1200)
  FTT_SIZE = 2048;
else if (HEIGHT > 800)
  FTT_SIZE = 1024;
else if (HEIGHT > 600)
  FTT_SIZE = 512;
else if (HEIGHT > 300)
  FTT_SIZE = 256;
else
  FTT_SIZE = 128;

let spiralMode = false;

window.onload = () => {
  try {
    ctxAudio = new (window.AudioContext || window.webkitAudioContext)(); 
    analyser = ctxAudio.createAnalyser();
    source = ctxAudio.createMediaElementSource(myAudio);

    source.connect(analyser);
    analyser.connect(ctxAudio.destination);
    
    document.querySelector("#file-audio").onchange = function(e) {
      e.preventDefault();
      if (document.getElementsByTagName('input')[0].files.length > 0)
      {
        myAudio.src = URL.createObjectURL(document.getElementsByTagName('input')[0].files[0]);
        document.querySelector("button img").src = "play.png";
        isPlaying = false;
        for (let k = 0; k < FTT_SIZE; k++) {
          pos[k] = 0;
        }
        visualize();
      }
    };
    document.querySelector("button").onclick = function(e) {
      e.preventDefault();
      ctxAudio.resume();
      if (!isPlaying) {
        myAudio.play();
        document.querySelector("button img").src = "pause.png";
      } else {
        myAudio.pause();
        document.querySelector("button img").src = "play.png";
      }
      isPlaying = !isPlaying;
    };
    document.querySelector("#spiralMode").onchange = function(e) {
      e.preventDefault();
      spiralMode = e.currentTarget.checked;
    };
    window.addEventListener("resize", (e) => {
      let finalSize;
      let iWidth = window.innerWidth - 100;
      let iHeight = window.innerHeight - 100;
      finalSize = (iWidth > iHeight) ? iHeight : iWidth;
      WIDTH = finalSize;
      HEIGHT = finalSize;
      canvas.width = finalSize;
      canvas.height = finalSize;
      MARGIN = finalSize / 8;
      LONGUEUR = (WIDTH / RATIO) - (RATIO * MARGIN);


      if (finalSize > 1200)
        FTT_SIZE = 2048;
      else if (finalSize > 800)
        FTT_SIZE = 1024;
      else if (finalSize > 600)
        FTT_SIZE = 512;
      else
        FTT_SIZE = 256;
      for (let k = 0; k < FTT_SIZE; k++) {
        pos[k] = 0;
      }
      
      analyser.fftSize = FTT_SIZE;
      var bufferLength = analyser.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);
    })
  }
  catch(e) {
    document.body.innerHTML = "Merci de choisir un navigateur supportant AudioContext (Chrome, Opera, Firefox, Edge)";
  }
}

function visualize()
{
  analyser.fftSize = FTT_SIZE;
  var bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);

  canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
  canvasCtx.imageSmoothingEnabled = false;

  function draw() {
    drawVisual = requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);

    canvasCtx.fillStyle = BLACK_COLOR;
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    function drawSpiral() {
      canvasCtx.lineWidth = 1;
      for(var i = 0; i < bufferLength; i++) {
        l = dataArray[i];
        let index = Math.floor(l / 32);
        pos[i] = (pos[i] + (l * SLOW_FACTOR[index]) / 720) % (2 * Math.PI);
        if (i % 2)
          canvasCtx.strokeStyle = WHITE_COLOR;
        else
          canvasCtx.strokeStyle = YELLOW_COLOR;
      
        canvasCtx.beginPath();
        canvasCtx.arc(WIDTH / 2, HEIGHT / 2, MARGIN + 5 + (i * (WIDTH - MARGIN - 10) / FTT_SIZE), START_POS + pos[i], (START_POS + pos[i] + (5 * Math.PI / 360)));
        if (pos[i] != 0)
          canvasCtx.stroke();
        canvasCtx.closePath();
      }
  
      canvasCtx.fillStyle = WHITE_COLOR;
      canvasCtx.arc(WIDTH / 2, HEIGHT / 2, 1, 0, 2 * Math.PI);
      canvasCtx.fill();
    }
    function drawRainbow() {
      let progression = (myAudio.currentTime / myAudio.duration) * 100;
    
      analyser.getByteFrequencyData(dataArray);
      
      var barWidth = ((Math.PI) / ((FTT_SIZE) * Math.PI / 180));
      
      canvasCtx.lineWidth = barWidth;
      var x = 0;
    
      for(var i = 0; i < bufferLength; i++) {
        l = dataArray[i];
    
        canvasCtx.beginPath();
        let lengthPercentage = Math.floor(l * 100 / 256);
        if (lengthPercentage < 15) {
          canvasCtx.strokeStyle = `rgb(192, 57, 43)`;
        } else if (lengthPercentage < 30) {
          canvasCtx.strokeStyle = `rgb(211, 84, 0)`;
        } else if (lengthPercentage < 45) {
          canvasCtx.strokeStyle = `rgb(243, 156, 18)`;
        } else if (lengthPercentage < 60) {
          canvasCtx.strokeStyle = `rgb(39, 174, 96)`;
        } else if (lengthPercentage < 75) {
          canvasCtx.strokeStyle = `rgb(22, 160, 133)`;
        } else if (lengthPercentage < 90) {
          canvasCtx.strokeStyle = `rgb(41, 128, 185)`;
        } else {
          canvasCtx.strokeStyle = `rgb(142, 68, 173)`;
        }
        let longueur = (l / 256) * LONGUEUR;
    
        function drawLine(signe) {
          xOuter = (WIDTH / 2) + ((MARGIN + longueur) * Math.cos((signe * x * Math.PI / 90) - (Math.PI / 2) ) );
          yOuter = (HEIGHT / 2) + ((MARGIN + longueur) * Math.sin((signe * x * Math.PI / 90) - (Math.PI / 2) ) );
          xInner = (WIDTH / 2) + (MARGIN * Math.cos((signe * x * Math.PI / 90) - (Math.PI / 2) ) );
          yInner = (HEIGHT / 2) + (MARGIN * Math.sin((signe * x * Math.PI / 90) - (Math.PI / 2) ) );
          canvasCtx.moveTo(xInner, yInner);
          canvasCtx.lineTo(xOuter, yOuter);
        }
        
        drawLine(1);
        drawLine(-1);
        canvasCtx.stroke();
        x += barWidth;
      }
      canvasCtx.strokeStyle = "rgb(42,42,42)";
      canvasCtx.beginPath();
      canvasCtx.lineWidth = 4;
      canvasCtx.arc(WIDTH / 2, HEIGHT / 2, MARGIN - 1.5, (-0.5 * Math.PI) + (-(progression * 180 / 100) * Math.PI / 180), (-0.5 * Math.PI) + ((progression * 180 / 100) * Math.PI / 180));
      canvasCtx.stroke();
    }
    if (spiralMode)
      drawSpiral();
    else
      drawRainbow();
  }
  draw();
}
