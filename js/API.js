export async function editUserImage(userImageFile, prompt) {
  const imgBase64 = await fileToBase64(userImageFile);

  const body = {
    model: "gpt-image-1",
    prompt: `
      Here is the input image in base64:
      ${imgBase64}

      Apply this transformation:
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
  if (data.error) throw new Error(data.error.message);

  return "data:image/png;base64," + data.data[0].b64_json;
}

function fileToBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.readAsDataURL(file);
  });
}
