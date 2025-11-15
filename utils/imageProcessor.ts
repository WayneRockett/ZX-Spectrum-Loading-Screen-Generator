
import { SPECTRUM_PALETTE_RGB } from '../constants';

// Using squared Euclidean distance is faster and sufficient for finding the minimum.
function colorDistanceSquared(c1: [number, number, number], c2: [number, number, number]): number {
  const dr = c1[0] - c2[0];
  const dg = c1[1] - c2[1];
  const db = c1[2] - c2[2];
  return dr * dr + dg * dg + db * db;
}

const colorMemo: { [key: string]: [number, number, number] } = {};

function findClosestColor(color: [number, number, number]): [number, number, number] {
  const colorKey = color.join(',');
  if (colorMemo[colorKey]) {
      return colorMemo[colorKey];
  }

  let minDistance = Infinity;
  let closestColor: [number, number, number] = SPECTRUM_PALETTE_RGB[0];

  for (const paletteColor of SPECTRUM_PALETTE_RGB) {
    const distance = colorDistanceSquared(color, paletteColor);
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = paletteColor;
    }
  }
  
  colorMemo[colorKey] = closestColor;
  return closestColor;
}

export const quantizeImage = (imageDataUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const targetWidth = 256;
      const targetHeight = 192;
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        return reject(new Error('Could not get canvas context'));
      }
      
      // Disable image smoothing for a crisp, pixelated look when resizing
      ctx.imageSmoothingEnabled = false;

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      
      const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        // Skip transparent pixels
        if (data[i + 3] === 0) continue;

        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        const closest = findClosestColor([r, g, b]);
        
        data[i] = closest[0];
        data[i + 1] = closest[1];
        data[i + 2] = closest[2];
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = (err) => reject(new Error(`Failed to load image for processing: ${err}`));
    img.src = imageDataUrl;
  });
};
