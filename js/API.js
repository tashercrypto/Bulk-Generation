// API.js
async function loadLocalLogo() {
  const response = await fetch("https://tashercrypto.github.io/Bulk-Generation/img/logo.jpg");
  const blob = await response.blob();
  return new File([blob], "logo.jpg", { type: "image/jpg" });
}

export async function editUserImage(userImageFile, prompt) {
  const formData = new FormData();
  const logoFile = await loadLocalLogo();

  formData.append("images", userImageFile);   
  formData.append("prompt", prompt);
  formData.append("logo", logoFile);

  const res = await fetch("https://bulk-generation-backend.onrender.com/generate-image", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error("Server error: " + text.slice(0, 200));
  }

  const data = await res.json();

  return data.url; // backend повертає url
}
