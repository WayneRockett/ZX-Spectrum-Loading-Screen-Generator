import { SPECTRUM_PALETTE_RGB } from '../constants';

// Using squared Euclidean distance for color matching
function colorDistanceSquared(c1: [number, number, number], c2: [number, number, number]): number {
  const dr = c1[0] - c2[0];
  const dg = c1[1] - c2[1];
  const db = c1[2] - c2[2];
  return dr * dr + dg * dg + db * db;
}

function findClosestColorIndex(color: [number, number, number]): number {
  let minDistance = Infinity;
  let closestIndex = 0;

  for (let i = 0; i < SPECTRUM_PALETTE_RGB.length; i++) {
    const distance = colorDistanceSquared(color, SPECTRUM_PALETTE_RGB[i]);
    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = i;
    }
  }
  
  return closestIndex;
}

// Convert image to ZX Spectrum .scr format
export const convertImageToScr = (imageDataUrl: string): Promise<{scrData: Uint8Array, previewDataUrl: string}> => {
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
      
      // Disable image smoothing for crisp pixels
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      
      const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
      const pixels = imageData.data;
      
      // Create color index array (256x192)
      const colorIndices: number[][] = [];
      for (let y = 0; y < targetHeight; y++) {
        colorIndices[y] = [];
        for (let x = 0; x < targetWidth; x++) {
          const pixelIndex = (y * targetWidth + x) * 4;
          const r = pixels[pixelIndex];
          const g = pixels[pixelIndex + 1];
          const b = pixels[pixelIndex + 2];
          colorIndices[y][x] = findClosestColorIndex([r, g, b]);
        }
      }
      
      // Allocate .scr file: 6144 bytes bitmap + 768 bytes attributes = 6912 bytes
      const scrData = new Uint8Array(6912);
      
      // Process each 8x8 character cell
      for (let row = 0; row < 24; row++) {
        for (let col = 0; col < 32; col++) {
          // Extract 8x8 tile colors
          const tileColors: number[] = [];
          for (let py = 0; py < 8; py++) {
            for (let px = 0; px < 8; px++) {
              const y = row * 8 + py;
              const x = col * 8 + px;
              tileColors.push(colorIndices[y][x]);
            }
          }
          
          // Find the two most common colors in this tile
          const colorCounts: { [key: number]: number } = {};
          for (const colorIdx of tileColors) {
            colorCounts[colorIdx] = (colorCounts[colorIdx] || 0) + 1;
          }
          
          const sortedColors = Object.entries(colorCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([color]) => parseInt(color));
          
          // Pick INK and PAPER colors
          let inkColor = sortedColors[0] || 0;
          let paperColor = sortedColors[1] || 0;
          
          // Ensure they're different
          if (inkColor === paperColor) {
            paperColor = inkColor === 0 ? 7 : 0;
          }
          
          // Determine BRIGHT bit
          // Colors 8-14 are bright variants; 0-7 are normal
          const inkBright = inkColor >= 8;
          const paperBright = paperColor >= 8;
          const bright = inkBright || paperBright ? 1 : 0;
          
          // Map to base color (0-7)
          const inkBase = inkColor % 8;
          const paperBase = paperColor % 8;
          
          // Encode attribute byte: FLASH(7) | BRIGHT(6) | PAPER(5-3) | INK(2-0)
          const attrByte = (bright << 6) | (paperBase << 3) | inkBase;
          const attrOffset = 6144 + row * 32 + col;
          scrData[attrOffset] = attrByte;
          
          // Generate bitmap for this tile
          for (let py = 0; py < 8; py++) {
            let bitByte = 0;
            for (let px = 0; px < 8; px++) {
              const tilePixelIdx = py * 8 + px;
              const colorIdx = tileColors[tilePixelIdx];
              
              // Decide if this pixel is INK (1) or PAPER (0)
              const distToInk = colorDistanceSquared(
                SPECTRUM_PALETTE_RGB[colorIdx],
                SPECTRUM_PALETTE_RGB[inkColor]
              );
              const distToPaper = colorDistanceSquared(
                SPECTRUM_PALETTE_RGB[colorIdx],
                SPECTRUM_PALETTE_RGB[paperColor]
              );
              
              const isInk = distToInk <= distToPaper;
              if (isInk) {
                bitByte |= (1 << (7 - px));
              }
            }
            
            // ZX Spectrum screen memory layout is non-linear
            const y = row * 8 + py;
            const screenOffset = getScreenOffset(y, col);
            scrData[screenOffset] = bitByte;
          }
        }
      }
      
      // Create preview image from the .scr data
      const previewCanvas = document.createElement('canvas');
      previewCanvas.width = 256;
      previewCanvas.height = 192;
      const previewCtx = previewCanvas.getContext('2d');
      if (!previewCtx) {
        return reject(new Error('Could not create preview context'));
      }
      
      const previewImageData = previewCtx.createImageData(256, 192);
      const previewPixels = previewImageData.data;
      
      // Render the .scr data back to preview
      for (let row = 0; row < 24; row++) {
        for (let col = 0; col < 32; col++) {
          const attrOffset = 6144 + row * 32 + col;
          const attrByte = scrData[attrOffset];
          
          const inkBase = attrByte & 0x07;
          const paperBase = (attrByte >> 3) & 0x07;
          const bright = (attrByte >> 6) & 0x01;
          
          // Reconstruct color indices
          // If bright is set, add 8 to get bright variant (but only if not white)
          const inkColorIdx = bright && inkBase !== 7 ? inkBase + 8 : inkBase;
          const paperColorIdx = bright && paperBase !== 7 ? paperBase + 8 : paperBase;
          
          // Make sure indices are within bounds
          const inkRgb = SPECTRUM_PALETTE_RGB[Math.min(inkColorIdx, SPECTRUM_PALETTE_RGB.length - 1)];
          const paperRgb = SPECTRUM_PALETTE_RGB[Math.min(paperColorIdx, SPECTRUM_PALETTE_RGB.length - 1)];
          
          for (let py = 0; py < 8; py++) {
            const y = row * 8 + py;
            const screenOffset = getScreenOffset(y, col);
            const bitByte = scrData[screenOffset];
            
            for (let px = 0; px < 8; px++) {
              const x = col * 8 + px;
              const bit = (bitByte >> (7 - px)) & 1;
              const rgb = bit ? inkRgb : paperRgb;
              
              const pixelIdx = (y * 256 + x) * 4;
              previewPixels[pixelIdx] = rgb[0];
              previewPixels[pixelIdx + 1] = rgb[1];
              previewPixels[pixelIdx + 2] = rgb[2];
              previewPixels[pixelIdx + 3] = 255;
            }
          }
        }
      }
      
      previewCtx.putImageData(previewImageData, 0, 0);
      const previewDataUrl = previewCanvas.toDataURL('image/png');
      
      resolve({ scrData, previewDataUrl });
    };
    
    img.onerror = (err) => reject(new Error(`Failed to load image: ${err}`));
    img.src = imageDataUrl;
  });
};

// Calculate ZX Spectrum screen memory offset
// The screen is divided into thirds, with interlaced scanlines
function getScreenOffset(y: number, col: number): number {
  const third = Math.floor(y / 64);
  const line = y % 8;
  const cell = Math.floor((y % 64) / 8);
  return third * 2048 + line * 256 + cell * 32 + col;
}

// Download .scr file
export const downloadScrFile = (scrData: Uint8Array, filename: string = 'screen.scr') => {
  const blob = new Blob([scrData as BlobPart], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
