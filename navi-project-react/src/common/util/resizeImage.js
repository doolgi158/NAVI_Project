export async function resizeImage(file, maxWidth, maxHeight) {
  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target.result;
    };

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // 원본 비율 유지하면서 리사이즈
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // 파일 유형에 따라 처리 분기
      const isPng = file.type === "image/png";

      if (!isPng) {
        // JPG 등 → 흰색 배경 채우기
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, width, height);
      }

      // 이미지 그리기
      ctx.drawImage(img, 0, 0, width, height);

      // toBlob 출력 타입 결정
      const outputType = isPng ? "image/png" : "image/jpeg";

      canvas.toBlob(
        (blob) => {
          const ext = isPng ? ".png" : ".jpg";
          const resizedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ext), {
            type: outputType,
          });
          resolve(resizedFile);
        },
        outputType,
        0.9
      );
    };

    reader.readAsDataURL(file);
  });
}