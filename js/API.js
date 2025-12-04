
async function loadLocalLogo() {
  const response = await fetch("img/logo.jpg");
  const blob = await response.blob();
  return new File([blob], "logo.jpg", { type: "image/jpeg" });
}

// ===============================
// API КЛЮЧ (просто вставляем сюда)
// ===============================
const API_KEY = "";   // ← твой ключ

// ===============================
// ОТПРАВКА ФОТО ПОЛЬЗОВАТЕЛЯ + logo.jpg В API
// ===============================
export async function editUserImage(userImageFile, prompt) {
  const formData = new FormData();
  const logoFile = await loadLocalLogo();

  formData.append("images", userImageFile);
  formData.append("images", logoFile);
  formData.append("prompt", prompt);

  const response = await fetch("https://your-backend-url/edit-image", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message);

  return "data:image/png;base64," + data.data[0].b64_json;
}

