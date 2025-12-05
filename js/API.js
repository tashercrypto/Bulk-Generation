async function loadLocalLogo() {
  try {
    // ⬇️ ВИПРАВЛЕНО: шукаємо logo.jpg
    const response = await fetch(`${window.location.origin}/img/logo.jpg`);
    
    if (!response.ok) {
      throw new Error("Logo not found");
    }
    
    const blob = await response.blob();
    return new File([blob], "logo.jpg", { type: "image/jpeg" });
    
  } catch (error) {
    console.error("❌ Logo not loaded:", error);
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
    } else {
      console.warn("⚠️ No logo, will use default star description");
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
