import { editUserImage } from "./API.js";

const upload = document.getElementById("imageUpload");
const iconImg = document.getElementById("icon-img");
const title = document.getElementById("title");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { 
  willReadFrequently: true,
  alpha: true 
});
const downloadBtn = document.getElementById("downloadBtn");
const sliderContainer = document.getElementById("sliderContainer");
const slider = document.getElementById("sizeSlider");
const controls = document.getElementById("controls");

let currentImg = null;
let scaleFactor = 1;
let offsetX = 0;
let offsetY = 0;
let lastX = 0;
let lastY = 0;
let isDragging = false;

// ФІКСОВАНИЙ РОЗМІР для відображення
const DISPLAY_SIZE = 400;

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
      offsetX = 0;
      offsetY = 0;

      iconImg.style.opacity = "0";
      iconImg.style.pointerEvents = "none";
      title.style.display = "none";

      // Внутрішній розмір canvas для високої якості (х2 для Retina)
      canvas.width = DISPLAY_SIZE * 2;
      canvas.height = DISPLAY_SIZE * 2;
      
      // CSS розмір для відображення (400x400)
      canvas.style.width = DISPLAY_SIZE + "px";
      canvas.style.height = DISPLAY_SIZE + "px";
      
      console.log("✅ Canvas:", canvas.width, "x", canvas.height, "→ display:", DISPLAY_SIZE + "px");

      drawImageWithFrame();
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function drawImageWithFrame() {
  if (!currentImg) return;

  const size = canvas.width; // Внутрішній розмір (800)
  
  // Налаштування якості
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  
  ctx.clearRect(0, 0, size, size);

  let img = currentImg;

  const baseScale = Math.max(size / img.width, size / img.height);
  const drawScale = baseScale * scaleFactor;

  const w = img.width * drawScale;
  const h = img.height * drawScale;

  const x = (size - w) / 2 + offsetX;
  const y = (size - h) / 2 + offsetY;

  const radius = size / 2 - (size * 0.09);

  // Малюємо зображення в круглій масці
  ctx.save();
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, radius, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(img, x, y, w, h);
  ctx.restore();

  // Малюємо рамку
  ctx.drawImage(frameImg, 0, 0, size, size);

  // Малюємо зірку
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
  link.href = canvas.toDataURL("image/png", 1.0);
  link.click();
});

// ============================================
// ДРУГИЙ CANVAS - ГЕНЕРАЦІЯ ЗОБРАЖЕНЬ
// ============================================

const canvasSecond = document.getElementById("canvas-second");
const ctxSecond = canvasSecond.getContext("2d", { 
  willReadFrequently: true,
  alpha: true 
});

const iconSecond = document.getElementById("icon-img-second");
const titleSecond = document.getElementById("title-second");
const generateBtn = document.getElementById("generateBtn");
const downloadEditedBtn = document.getElementById("downloadEditedBtn");

const secondUpload = document.createElement("input");
secondUpload.type = "file";
secondUpload.accept = "image/*";
secondUpload.style.display = "none";
document.body.appendChild(secondUpload);

let secondImageFile = null;
let currentSecondImage = null;

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

// ФУНКЦІЯ: Малювання зображення зберігаючи пропорції
function drawImageToSecondCanvas(img) {
  console.log("🎨 Drawing image:", img.width, "x", img.height);
  
  // Висота завжди 400px (відображення)
  const displayHeight = 400;
  
  // Обчислюємо ширину зберігаючи пропорції
  const aspectRatio = img.width / img.height;
  const displayWidth = Math.round(displayHeight * aspectRatio);
  
  // Внутрішній розмір canvas (х2 для високої якості)
  const internalWidth = displayWidth * 2;
  const internalHeight = displayHeight * 2;
  
  canvasSecond.width = internalWidth;
  canvasSecond.height = internalHeight;
  
  // CSS розмір для відображення
  canvasSecond.style.width = displayWidth + "px";
  canvasSecond.style.height = displayHeight + "px";
  
  console.log("✅ Canvas:", internalWidth, "x", internalHeight, "→ display:", displayWidth, "x", displayHeight);
  
  // Малюємо з високою якістю
  ctxSecond.imageSmoothingEnabled = true;
  ctxSecond.imageSmoothingQuality = "high";
  
  ctxSecond.clearRect(0, 0, internalWidth, internalHeight);
  ctxSecond.drawImage(img, 0, 0, internalWidth, internalHeight);
  
  console.log("✅ Image drawn with high quality");
}

// Клік по canvas
canvasSecond.addEventListener("click", () => secondUpload.click());
iconSecond.addEventListener("click", () => secondUpload.click());
titleSecond.addEventListener("click", () => secondUpload.click());

// Завантаження файлу
secondUpload.addEventListener("change", () => {
  const file = secondUpload.files[0];
  if (!file) return;
  
  secondImageFile = file;
  generateBtn.style.display = "block";
  downloadEditedBtn.style.display = "block";
  titleSecond.style.display = "none";
  iconSecond.style.opacity = "0";

  const img = new Image();
  img.onload = () => {
    currentSecondImage = img;
    drawImageToSecondCanvas(img);
  };
  img.src = URL.createObjectURL(file);
});

// Drag & Drop
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
  if (!file) return;
  
  secondImageFile = file;
  generateBtn.style.display = "block";
  downloadEditedBtn.style.display = "block";
  titleSecond.style.display = "none";
  iconSecond.style.opacity = "0";

  const img = new Image();
  img.onload = () => {
    currentSecondImage = img;
    drawImageToSecondCanvas(img);
  };
  img.src = URL.createObjectURL(file);
});

// ГЕНЕРАЦІЯ
generateBtn.addEventListener("click", async () => {
  if (!secondImageFile) {
    alert("Завантажте фото у другий canvas!");
    return;
  }

  showCanvas2Overlay();

  const prompt = "Отредактируй только головной убор на предоставленной фотографии.Ничего в изображении менять нельзя — ни фон, ни композицию, ни цвет, ни стиль, ни освещение, ни детали персонажа. Исходная фотография должна остаться полностью неизменной, кроме одного элемента: добавь на персонажа классическую чёрную кепку. Требования к кепке Классическая чёрная однотонная кепка. Без отверстий, без вентиляционных дырок, без строчек и без любых лишних элементов сверху. Форма гладкая, аккуратная, естественная. Кепка не должна быть обрезана — персонаж вместе с кепкой должен быть виден полностью. Кепка слегка повернута влево (козырёк немного развёрнут). Логотип На передней части кепки нанести идеально точный логотип в виде светлой восьмиконечной звезды. Логотип должен быть строго 1:1 по форме, пропорциям и углам относительно предоставленного референса. Нельзя менять: толщину лучей, длину лучей, углы, пропорции, форму, наклон. Линии должны быть идеально чёткими, с высоким контрастом, без размытий, сглаживаний или стилизации. Звезда должна быть размещена строго по центру кепки. Интеграция Если в исходном изображении есть любой головной убор (шлем, капюшон, панама и т.п.) — полностью удали его и замени на кепку. Персонаж может быть любым (не обязательно человек) — просто обеспечь естественную посадку кепки по форме головы/верхней части. Тени, перспектива и взаимодействие с освещением должны быть максимально реалистичными. Общий стиль, качество и цветокор исходной фотографии должны оставаться неизменными.";

  try {
    console.log("🚀 Starting generation...");
    console.log("📤 Sending file:", secondImageFile.name);
    
    const resultUrl = await editUserImage(secondImageFile, prompt);
    
    console.log("📦 Result received");

    const img = new Image();
    
    img.onload = () => {
      console.log("✅ Generated image loaded:", img.width, "x", img.height);
      
      currentSecondImage = img;
      drawImageToSecondCanvas(img);
      
      hideCanvas2Overlay();
      console.log("✅ GENERATION COMPLETE");
    };
    
    img.onerror = (e) => {
      console.error("❌ Image load error:", e);
      hideCanvas2Overlay();
      alert("Помилка завантаження результату");
    };
    
    img.src = resultUrl;
    
  } catch (err) {
    console.error("❌ API Error:", err);
    hideCanvas2Overlay();
    alert("Помилка API: " + err.message);
  }
});

// ЗАВАНТАЖЕННЯ
downloadEditedBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "generated.png";
  link.href = canvasSecond.toDataURL("image/png", 1.0);
  link.click();
});
