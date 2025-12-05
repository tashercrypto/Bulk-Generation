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

let generatedImage = null;

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



// ============================================
// ДРУГИЙ CANVAS - ГЕНЕРАЦІЯ ЗОБРАЖЕНЬ
// ============================================

const canvasSecond = document.getElementById("canvas-second");
const ctxSecond = canvasSecond.getContext("2d", { willReadFrequently: true });

const iconSecond = document.getElementById("icon-img-second");
const titleSecond = document.getElementById("title-second");

const secondUpload = document.createElement("input");
secondUpload.type = "file";
secondUpload.accept = "image/*";
secondUpload.style.display = "none";
document.body.appendChild(secondUpload);

const generateBtn = document.getElementById("generateBtn");
const downloadEditedBtn = document.getElementById("downloadEditedBtn");

let secondImageFile = null;
let generatedImage = null;
let isGenerating = false; // ⬅️ Флаг для блокування

// Overlay для завантаження
let _canvas2Overlay = null;
function showCanvas2Overlay() {
  if (_canvas2Overlay) return;
  const container = canvasSecond.closest(".canvas-container") || canvasSecond.parentElement;
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

// Функція для малювання на другому canvas
function drawToSecondCanvas(image) {
  ctxSecond.save();
  ctxSecond.clearRect(0, 0, canvasSecond.width, canvasSecond.height);
  ctxSecond.drawImage(image, 0, 0, canvasSecond.width, canvasSecond.height);
  ctxSecond.restore();
  console.log("🎨 Canvas updated with image");
}

// Клік по canvas для завантаження
canvasSecond.addEventListener("click", (e) => {
  if (isGenerating) {
    e.preventDefault();
    e.stopPropagation();
    return;
  }
  secondUpload.click();
});

iconSecond.addEventListener("click", (e) => {
  if (isGenerating) {
    e.preventDefault();
    e.stopPropagation();
    return;
  }
  secondUpload.click();
});

titleSecond.addEventListener("click", (e) => {
  if (isGenerating) {
    e.preventDefault();
    e.stopPropagation();
    return;
  }
  secondUpload.click();
});

// Завантаження файлу через input
secondUpload.addEventListener("change", () => {
  const file = secondUpload.files[0];
  if (!file) return;

  secondImageFile = file;
  generatedImage = null; // Скидаємо згенероване зображення
  isGenerating = false;

  generateBtn.style.display = "block";
  downloadEditedBtn.style.display = "block";

  titleSecond.style.display = "none";
  iconSecond.style.opacity = "0";

  const img = new Image();
  img.onload = () => {
    drawToSecondCanvas(img);
  };
  img.src = URL.createObjectURL(file);
});

// Drag & Drop
canvasSecond.addEventListener("dragover", (e) => {
  if (isGenerating) return;
  e.preventDefault();
  canvasSecond.classList.add("dragover");
});

canvasSecond.addEventListener("dragleave", () => {
  if (isGenerating) return;
  canvasSecond.classList.remove("dragover");
});

canvasSecond.addEventListener("drop", (e) => {
  if (isGenerating) {
    e.preventDefault();
    return;
  }
  
  e.preventDefault();
  canvasSecond.classList.remove("dragover");

  const file = e.dataTransfer.files[0];
  if (!file) return;

  secondImageFile = file;
  generatedImage = null;
  isGenerating = false;

  generateBtn.style.display = "block";
  downloadEditedBtn.style.display = "block";

  titleSecond.style.display = "none";
  iconSecond.style.opacity = "0";

  const img = new Image();
  img.onload = () => {
    drawToSecondCanvas(img);
  };
  img.src = URL.createObjectURL(file);
});

generateBtn.addEventListener("click", async () => {
  if (!secondImageFile) {
    alert("Завантажте фото у другий canvas!");
    return;
  }

  if (isGenerating) {
    console.warn("⚠️ Generation already in progress");
    return;
  }

  isGenerating = true;
  showCanvas2Overlay();

  const prompt = `Replace any headwear with a classic solid black baseball cap. The cap should have a white 8-pointed star logo centered on the front panel. Keep everything else unchanged: same background, lighting, colors, character pose and details. The cap should fit naturally with realistic shadows. Cap brim slightly turned to the left.`;

  try {
    console.log("🚀 Starting generation...");
    console.log("📤 Sending file:", secondImageFile.name);
    
    const resultUrl = await editUserImage(secondImageFile, prompt);

    console.log("📦 Result URL length:", resultUrl.length);
    console.log("📦 First 200 chars:", resultUrl.substring(0, 200));
    
    // ⬇️ ПЕРЕВІРКА: Чи це base64 PNG?
    if (!resultUrl.startsWith("data:image/png;base64,")) {
      throw new Error("Invalid image format received");
    }

    // ⬇️ ТИМЧАСОВО: Показуємо зображення в новому вікні для перевірки
    const testWindow = window.open();
    testWindow.document.write(`<img src="${resultUrl}" style="max-width:100%">`);
    console.log("🔍 Test window opened - check if image has a cap!");

    const img = new Image();

    img.onload = () => {
      console.log("✅ Generated image loaded!");
      console.log("🖼️ Image dimensions:", img.width, "x", img.height);
      console.log("🎨 Drawing to canvas...");

      generatedImage = img;

      // ⬇️ ВАЖЛИВО: Малюємо ТІЛЬКИ згенероване зображення
      ctxSecond.clearRect(0, 0, canvasSecond.width, canvasSecond.height);
      ctxSecond.fillStyle = "red"; // ⬅️ Червоний фон для діагностики
      ctxSecond.fillRect(0, 0, canvasSecond.width, canvasSecond.height);
      
      setTimeout(() => {
        ctxSecond.clearRect(0, 0, canvasSecond.width, canvasSecond.height);
        ctxSecond.drawImage(img, 0, 0, canvasSecond.width, canvasSecond.height);
        console.log("🎨 Image drawn to canvas");
      }, 100);

      setTimeout(() => {
        hideCanvas2Overlay();
        isGenerating = false;
        console.log("✅ GENERATION COMPLETE");
      }, 500);
    };

    img.onerror = (e) => {
      console.error("❌ Image load error:", e);
      hideCanvas2Overlay();
      isGenerating = false;
      alert("Помилка завантаження результату");
    };

    console.log("🖼️ Setting img.src...");
    img.src = resultUrl;

  } catch (err) {
    console.error("❌ API Error:", err);
    hideCanvas2Overlay();
    isGenerating = false;
    alert("Помилка API: " + err.message);
  }
});
// ЗАВАНТАЖЕННЯ РЕЗУЛЬТАТУ
downloadEditedBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "generated.png";
  link.href = canvasSecond.toDataURL("image/png");
  link.click();
});

// ⬇️ ВАЖЛИВО: Періодична перемальовка згенерованого зображення
setInterval(() => {
  if (generatedImage && !isGenerating) {
    drawToSecondCanvas(generatedImage);
  }
}, 500); // Кожні 500ms перемальовуємо, якщо є згенероване зображення
