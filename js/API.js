async function loadLocalLogo() {
  try {
    const response = await fetch(`${window.location.origin}/img/star.png`);
    if (!response.ok) {
      // Пробуємо JPEG
      const jpegResponse = await fetch(`${window.location.origin}/img/star.jpg`);
      if (!jpegResponse.ok) throw new Error("Logo not found");
      const blob = await jpegResponse.blob();
      return new File([blob], "star.jpg", { type: "image/jpeg" });
    }
    const blob = await response.blob();
    return new File([blob], "star.png", { type: "image/png" });
  } catch (error) {
    console.warn("Logo not loaded:", error);
    return null;
  }
}

export async function editUserImage(userImageFile, prompt) {
  try {
    const formData = new FormData();
    formData.append("image", userImageFile);

    // Додаємо лого
    const logoFile = await loadLocalLogo();
    if (logoFile) {
      formData.append("logo", logoFile);
      console.log("✅ Logo attached:", logoFile.name);
    }

    formData.append("prompt", prompt);

    const response = await fetch(
      "https://bulk-generation-backend.onrender.com/generate-image",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Server error");
    }

    const data = await response.json();
    return "data:image/png;base64," + data.data[0].b64_json;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}
