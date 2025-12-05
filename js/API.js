export async function editUserImage(userImageFile, prompt) {
  const imgBase64 = await fileToBase64(userImageFile);

  const body = {
    model: "gpt-image-1",
    prompt: `
Here is the image encoded as base64:
${imgBase64}

Now apply the following transformation ONLY to the headwear:
${prompt}
    `,
    size: "1024x1024",
    n: 1
  };

  const response = await fetch("https://bulk-generation-backend.onrender.com/generate-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (data.error) {
    console.error("API ERROR:", data.error);
    throw new Error(data.error.message);
  }

  return "data:image/png;base64," + data.data[0].b64_json;
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
