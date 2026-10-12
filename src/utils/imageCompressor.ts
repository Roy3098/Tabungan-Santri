/**
 * Utility for compressing images and Base64 data URLs on the client
 * so they never exceed Firestore's 1MB (1,048,576 bytes) document size limit
 * or localStorage quotas.
 */

const MAX_FIRESTORE_SAFE_CHARS = 450_000; // ~450KB max string length (well below 1MB Firestore limit)

/**
 * Compresses an uploaded File (PNG, JPG, WEBP, SVG) into a compact Data URL.
 */
export async function compressImageFile(
  file: File,
  maxDimension = 512,
  quality = 0.86
): Promise<string> {
  const rawDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string) || '');
    reader.onerror = () => reject(new Error('Gagal membaca berkas gambar'));
    reader.readAsDataURL(file);
  });

  // If it's already an SVG and small enough, keep it as-is
  if (file.type === 'image/svg+xml' && rawDataUrl.length <= MAX_FIRESTORE_SAFE_CHARS) {
    return rawDataUrl;
  }

  return compressBase64Image(rawDataUrl, maxDimension, quality, true);
}

/**
 * Ensures any Base64 image string is resized/compressed so it stays well under
 * Firestore's 1,048,576-byte document size limit.
 */
export async function compressBase64Image(
  dataUrl?: string,
  maxDimension = 512,
  quality = 0.85,
  forceResize = false
): Promise<string> {
  if (!dataUrl || typeof dataUrl !== 'string') return '';

  // If it's a normal URL or already small enough and doesn't need forced resize, return immediately
  if (!dataUrl.startsWith('data:image/')) {
    return dataUrl.length <= MAX_FIRESTORE_SAFE_CHARS ? dataUrl : '';
  }

  if (!forceResize && dataUrl.length <= MAX_FIRESTORE_SAFE_CHARS) {
    return dataUrl;
  }

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return dataUrl.length <= MAX_FIRESTORE_SAFE_CHARS ? dataUrl : '';
  }

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.onload = () => resolve(image);
      image.onerror = (err) => reject(err);
      image.src = dataUrl;
    });

    let width = img.naturalWidth || img.width || maxDimension;
    let height = img.naturalHeight || img.height || maxDimension;

    if (width > maxDimension || height > maxDimension) {
      if (width >= height) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, width);
    canvas.height = Math.max(1, height);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return dataUrl.length <= MAX_FIRESTORE_SAFE_CHARS ? dataUrl : '';
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Prefer WebP because it supports alpha transparency and produces very small files (~25-60KB)
    let compressed = canvas.toDataURL('image/webp', quality);

    // Fallback to PNG if browser doesn't encode WebP or if still too large
    if (!compressed.startsWith('data:image/webp') && compressed.length > MAX_FIRESTORE_SAFE_CHARS) {
      compressed = canvas.toDataURL('image/jpeg', 0.8);
    }

    // If still above safe threshold, scale down further to 256x256
    if (compressed.length > MAX_FIRESTORE_SAFE_CHARS) {
      const smallCanvas = document.createElement('canvas');
      smallCanvas.width = 256;
      smallCanvas.height = Math.max(1, Math.round((height * 256) / width));
      const smallCtx = smallCanvas.getContext('2d');
      if (smallCtx) {
        smallCtx.clearRect(0, 0, smallCanvas.width, smallCanvas.height);
        smallCtx.drawImage(canvas, 0, 0, smallCanvas.width, smallCanvas.height);
        compressed = smallCanvas.toDataURL('image/webp', 0.78);
      }
    }

    return compressed.length <= MAX_FIRESTORE_SAFE_CHARS ? compressed : '';
  } catch (err) {
    console.warn('Gagal mengompresi gambar, menggunakan fallback aman:', err);
    return dataUrl.length <= MAX_FIRESTORE_SAFE_CHARS ? dataUrl : '';
  }
}
