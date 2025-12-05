import { editUserImage } from "./API.js";

const upload = document.getElementById("imageUpload");
const iconImg = document.getElementById("icon-img");
const title = document.getElementById("title");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const downloadBtn = document.getElementById("downloadBtn");
const sliderContainer = document.getElementById("sliderContainer");
const slider = document.getElementById("sizeSlider");
const controls = document.getElementById("controls");

let currentImg = null;
let scaleFactor = 1;

// ---------------------------
let offsetX = 0;
let offsetY = 0;



let lastX = 0;
let lastY = 0;
let isDragging = false;

let dragStartX = 0;
let dragStartY = 0;
// -------------------------

canvas.addEventListener("click", () => upload.click());
iconImg.addEventListener("click", () => upload.click());
title.addEventListener("click", () => upload.click());

upload.addEventListener("change", function () {
  const file = upload.files[0];
  loadImageFile(file);
});

canvas.addEventListener("dragover", (e) => {
  e.preventDefault();
  canvas.classList.add("dragover");
});
canvas.addEventListener("dragleave", () => {
  canvas.classList.remove("dragover");
});
canvas.addEventListener("drop", (e) => {
  e.preventDefault();
  canvas.classList.remove("dragover");
  loadImageFile(e.dataTransfer.files[0]);
});

canvas.style.touchAction = "none";
canvas.style.userSelect = "none";

function getPos(e) {
  if (e.touches) {
    return {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  }
  return { x: e.clientX, y: e.clientY };
}


canvas.addEventListener("mousedown", startDrag);
canvas.addEventListener("touchstart", startDrag);

function startDrag(e) {
  if (!currentImg) return;

  isDragging = true;

  const pos = getPos(e);
  lastX = pos.x;
  lastY = pos.y;

  e.preventDefault();
}

canvas.addEventListener("mousemove", drag);
canvas.addEventListener("touchmove", drag);

function drag(e) {
  if (!isDragging) return;

  const pos = getPos(e);

  const dx = pos.x - lastX;
  const dy = pos.y - lastY;

  lastX = pos.x;
  lastY = pos.y;

  offsetX += dx;
  offsetY += dy;

  drawImageWithFrame();
}

canvas.addEventListener("mouseup", endDrag);
canvas.addEventListener("mouseleave", endDrag);
canvas.addEventListener("touchend", endDrag);

function endDrag() {
  isDragging = false;
}


function loadImageFile(file) {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function () {
    const img = new Image();
    img.onload = () => {
      currentImg = img;
      scaleFactor = 1;
      slider.value = 1;

      iconImg.style.opacity = "0";
      iconImg.style.pointerEvents = "none";

      title.style.display = "none";

      drawImageWithFrame();
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}



function drawImageWithFrame() {
  if (!currentImg) return;

  const size = canvas.width;
  ctx.clearRect(0, 0, size, size);


  let img = currentImg;

  const baseScale = Math.max(size / img.width, size / img.height);
  const drawScale = baseScale * scaleFactor;

  const w = img.width * drawScale;
  const h = img.height * drawScale;

const x = (size - w) / 2 + offsetX;
const y = (size - h) / 2 + offsetY;



  const radius = size / 2 - (size * 0.09);


  ctx.save();
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, radius, 0, Math.PI * 2);
  ctx.clip();

  ctx.drawImage(img, x, y, w, h);
  ctx.restore();


  ctx.drawImage(frameImg, 0, 0, size, size);


  drawStarOnFrame();

  downloadBtn.style.display = "block";
  sliderContainer.style.display = "flex";
  controls.style.display = "flex";
}


slider.addEventListener("input", () => {
  scaleFactor = parseFloat(slider.value);
  drawImageWithFrame();
});

const frameColorInput = document.getElementById("frameColor");
let frameColor = "#000000";
let frameSVGText = "";
let frameImg = new Image();
fetch("img/frame.svg")
  .then((res) => res.text())
  .then((svg) => {
    frameSVGText = svg;
    updateFrameColor();
  });

const starImg = new Image();
starImg.src = "img/star.png";

function updateFrameColor() {
  if (!frameSVGText) return;

  const updatedSVG = frameSVGText
    .replace(/stroke="[^"]*"/g, `stroke="${frameColor}"`)
    .replace(/fill="[^"]*"/g, `fill="${frameColor}"`);

  const blob = new Blob([updatedSVG], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);

  frameImg.onload = () => {
    drawImageWithFrame();
    URL.revokeObjectURL(url);
  };
  frameImg.src = url;
}

frameColorInput.addEventListener("input", (e) => {
  frameColor = e.target.value;
  updateFrameColor();
});

function drawStarOnFrame() {
  const size = canvas.width;

  const starWidth = size * 0.3;
  const starHeight = size * 0.3;

  const x = (size - starWidth) / 2;
  const y = size - starHeight * 1.05;

  ctx.drawImage(starImg, x, y, starWidth, starHeight);
}

downloadBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "avatar.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});




const canvasSecond = document.getElementById("canvas-second");
const ctxSecond = canvasSecond.getContext("2d");

const iconSecond = document.getElementById("icon-img-second");
const titleSecond = document.getElementById("title-second");

const secondUpload = document.createElement("input");

const generateBtn = document.getElementById("generateBtn");
const downloadEditedBtn = document.getElementById("downloadEditedBtn");
secondUpload.type = "file";
secondUpload.accept = "image/*";
secondUpload.style.display = "none";

document.body.appendChild(secondUpload);

let secondImageFile = null;


let _canvas2Overlay = null;
function showCanvas2Overlay() {
  if (_canvas2Overlay) return;
  const container =
    canvasSecond.closest(".canvas-container") || canvasSecond.parentElement;
  const overlay = document.createElement("div");
  overlay.className = "canvas-overlay";
  overlay.setAttribute("aria-hidden", "true");

  const spinner = document.createElement("div");
  spinner.className = "overlay-spinner";
  overlay.appendChild(spinner);


  overlay.style.pointerEvents = "auto";
  overlay.addEventListener("click", (e) => e.stopPropagation());

  container.appendChild(overlay);
  _canvas2Overlay = overlay;
}

function hideCanvas2Overlay() {
  if (!_canvas2Overlay) return;
  _canvas2Overlay.remove();
  _canvas2Overlay = null;
}

canvasSecond.addEventListener("click", () => secondUpload.click());
iconSecond.addEventListener("click", () => secondUpload.click());
titleSecond.addEventListener("click", () => secondUpload.click());

secondUpload.addEventListener("change", () => {
  const file = secondUpload.files[0];
  secondImageFile = file;
  generateBtn.style.display = "block";
  downloadEditedBtn.style.display = "block";

  titleSecond.style.display = "none";
  iconSecond.style.opacity = "0";

  const img = new Image();
  img.onload = () => {
    ctxSecond.clearRect(0, 0, 400, 400);
    ctxSecond.drawImage(img, 0, 0, 400, 400);
  };

  img.src = URL.createObjectURL(file);
});

canvasSecond.addEventListener("dragover", (e) => {
  e.preventDefault();
  canvasSecond.classList.add("dragover");
});
canvasSecond.addEventListener("dragleave", () => {
  canvasSecond.classList.remove("dragover");
});
canvasSecond.addEventListener("drop", (e) => {
  e.preventDefault();
  canvasSecond.classList.remove("dragover");

  const file = e.dataTransfer.files[0];
  secondImageFile = file;

  generateBtn.style.display = "block";
  downloadEditedBtn.style.display = "block";

  titleSecond.style.display = "none";
  iconSecond.style.opacity = "0";

  const img = new Image();
  img.onload = () => {
    ctxSecond.clearRect(0, 0, 400, 400);
    ctxSecond.drawImage(img, 0, 0, 400, 400);
  };

  img.src = URL.createObjectURL(file);
});


document.getElementById("generateBtn").addEventListener("click", async () => {
  if (!secondImageFile) {
    alert("Загрузите фото во второй канвас!");
    return;
  }

  showCanvas2Overlay();

  const prompt = `Replace any headwear with a classic solid black baseball cap. The cap should have a white 8-pointed star logo centered on the front panel. Keep everything else unchanged: same background, lighting, colors, character pose and details. The cap should fit naturally with realistic shadows. Cap brim slightly turned to the left.`;

  try {
    console.log("🚀 Starting generation...");
    const resultUrl = await editUserImage(secondImageFile, prompt);
    
    console.log("📦 Result URL length:", resultUrl.length);
    console.log("📦 First 100 chars:", resultUrl.substring(0, 100));

    const img = new Image();
    
    img.onload = () => {
      console.log("✅ IMG ONLOAD FIRED!");
      console.log("Image dimensions:", img.width, "x", img.height);
      console.log("Canvas dimensions:", canvasSecond.width, "x", canvasSecond.height);
      
      ctxSecond.clearRect(0, 0, canvasSecond.width, canvasSecond.height);
      ctxSecond.drawImage(img, 0, 0, canvasSecond.width, canvasSecond.height);
      
      console.log("✅ Image drawn to canvas");
      hideCanvas2Overlay();
    };
    
    img.onerror = (e) => {
      console.error("❌ IMG ONERROR FIRED!");
      console.error("Error event:", e);
      hideCanvas2Overlay();
      alert("Ошибка при загрузке результата.");
    };
    
    console.log("🖼️ Setting img.src...");
    img.src = resultUrl;
    
  } catch (err) {
    hideCanvas2Overlay();
    alert("Ошибка API: " + err.message);
    console.error(err);
  }
});


document.getElementById("downloadEditedBtn").addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "edited.png";
  link.href = canvasSecond.toDataURL("image/png");
  link.click();
});
