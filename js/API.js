// ❗ ВИДАЛЯЄМО функцію loadLocalLogo - вона більше не потрібна

export async function editUserImage(userImageFile, prompt) {
  try {
    console.log("=== Starting image edit ===");
    console.log("File:", userImageFile.name, userImageFile.type);
    console.log("Prompt length:", prompt.length);

    // Обрізаємо промпт до 1000 символів
    const truncatedPrompt = prompt.slice(0, 1000);

    // Створюємо FormData
    const formData = new FormData();
    
    // ❗ ДОДАЄМО ТІЛЬКИ ОДИН ФАЙЛ
    formData.append("image", userImageFile);
    formData.append("prompt", truncatedPrompt);

    console.log("Sending request to backend...");

    const response = await fetch(
      "https://bulk-generation-backend.onrender.com/generate-image",
      {
        method: "POST",
        body: formData,
        // ❗ НЕ додаємо headers - браузер сам додасть правильні
      }
    );

    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server error:", errorText);
      
      let errorMessage;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || errorText;
      } catch {
        errorMessage = errorText;
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("Response received:", !!data.data);

    // Перевіряємо формат відповіді
    if (!data.data || !data.data[0] || !data.data[0].b64_json) {
      console.error("Invalid response format:", data);
      throw new Error("Invalid response format from server");
    }

    const base64Image = "data:image/png;base64," + data.data[0].b64_json;
    console.log("Image ready, size:", base64Image.length);

    return base64Image;
  } catch (error) {
    console.error("=== API Error ===");
    console.error(error);
    throw error;
  }
}
