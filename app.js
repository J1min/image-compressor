const imageInput = document.getElementById("imageInput");
const previewImage = document.getElementById("previewImage");
const downloadBtn = document.getElementById("downloadBtn");

let compressedBlob = null;

imageInput.addEventListener("change", async function (e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  try {
    const dataUrl = await readFileAsDataURL(file);
    const image = await loadImage(dataUrl);

    previewImage.src = dataUrl;
    previewImage.style.display = "block";

    compressedBlob = await convertImageToCompressedBlob(image);
    downloadBtn.disabled = false;
  } catch (error) {
    alert("이미지 처리 중 오류가 발생했습니다.");
    console.error(error);
  }
});

downloadBtn.addEventListener("click", function () {
  if (!compressedBlob) return;

  const url = URL.createObjectURL(compressedBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "compressed-image.jpg";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

function readFileAsDataURL(file) {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();
    reader.onload = function () {
      if (typeof reader.result !== "string") {
        reject(new Error("Invalid data URL"));
      } else {
        resolve(reader.result);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadImage(url) {
  return new Promise(function (resolve, reject) {
    const image = new Image();
    image.onload = function () {
      resolve(image);
    };
    image.onerror = reject;
    image.src = url;
  });
}

function convertImageToCompressedBlob(image) {
  const MAX_WIDTH = 1024;
  const MAX_HEIGHT = 1024;
  const BLOB_TYPE = "image/jpg";
  const BLOB_QUALITY = 0.7;

  return new Promise(function (resolve, reject) {
    const canvas = document.createElement("canvas");
    const ratio = Math.min(
      MAX_WIDTH / image.width,
      MAX_HEIGHT / image.height,
      1
    );

    const newWidth = image.width * ratio;
    const newHeight = image.height * ratio;
    canvas.width = newWidth;
    canvas.height = newHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("Canvas context not available"));
      return;
    }

    ctx.drawImage(image, 0, 0, newWidth, newHeight);

    canvas.toBlob(
      function (blob) {
        if (!blob) {
          reject(new Error("Failed to create blob"));
          return;
        }
        resolve(blob);
      },
      BLOB_TYPE,
      BLOB_QUALITY
    );
  });
}
