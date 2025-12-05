
async function loadLocalLogo() {
  const response = await fetch("img/logo.jpg");
  const blob = await response.blob();
  return new File([blob], "logo.jpg", { type: "image/jpeg" });
}


export async function editUserImage(userImageFile, prompt) {
  const formData = new FormData();
  const logoFile = await loadLocalLogo();

  formData.append("images", userImageFile);
  formData.append("images", logoFile);
  formData.append("prompt", prompt);

const response = await fetch("https://bulk-generation-backend.onrender.com/generate-image", {
  method: "POST",
  mode: "cors",
  body: formData
});

if (!response.ok) {
    const text = await response.text();
    throw new Error("Server error: " + text);
}

const data = await response.json();

if (data.error) throw new Error(data.error.message);

return "data:image/png;base64," + data.data[0].b64_json;

  const data = await response.json();
  if (data.error) throw new Error(data.error.message);

  return "data:image/png;base64," + data.data[0].b64_json;
}

