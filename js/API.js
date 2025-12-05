async function loadLocalLogo() {
  const response = await fetch("https://tashercrypto.github.io/Bulk-Generation/img/star.png");
  const blob = await response.blob();
  return new File([blob], "mask.png", { type: "image/png" });
}



export async function editUserImage(userImageFile, prompt) {
  const formData = new FormData();
  const logoFile = await loadLocalLogo();


formData.append("image", userImageFile);
formData.append("mask", logoFile);
formData.append("prompt", prompt);



  const response = await fetch("https://bulk-generation-backend.onrender.com/edit-image", {
    method: "POST",
    mode: "cors",
    body: formData,
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message);

  return "data:image/png;base64," + data.data[0].b64_json;
}
