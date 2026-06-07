/**
 * Resizes and compresses an image from a data URL or File using HTML5 Canvas.
 * Limits the maximum dimension (width or height) to maxDim and compresses it to JPEG at 70% quality.
 */
export function resizeImage(dataUrl: string, maxDim: number = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get 2d context from canvas'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      // Compress to JPEG with 0.7 quality
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
      resolve(compressedDataUrl);
    };
    img.onerror = (err) => {
      reject(new Error('Failed to load image for resizing'));
    };
    img.src = dataUrl;
  });
}

/**
 * Reads a File object as a data URL.
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
