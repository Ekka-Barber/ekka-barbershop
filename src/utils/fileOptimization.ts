
export interface OptimizedFile {
  file: Blob;
  type: string;
  name: string;
  originalHash: string;
}

async function calculateHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function optimizeImage(file: File): Promise<OptimizedFile | null> {
  return new Promise((resolve) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      let width = img.width;
      let height = img.height;
      
      const MAX_DIMENSION = 2500;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = (height * MAX_DIMENSION) / width;
          width = MAX_DIMENSION;
        } else {
          width = (width * MAX_DIMENSION) / height;
          height = MAX_DIMENSION;
        }
      }

      canvas.width = width;
      canvas.height = height;
      
      if (!ctx) return resolve(null);
      
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      ctx.drawImage(img, 0, 0, width, height);
      
      const mimeType = file.type === 'image/png' ? 'image/webp' : file.type;
      const quality = 0.9;

      canvas.toBlob(
        async (blob) => {
          if (!blob) return resolve(null);
          
          const optimizedFile = new File([blob], file.name, {
            type: mimeType
          });
          
          const hash = await calculateHash(file);
          
          resolve({
            file: blob,
            type: mimeType,
            name: file.name,
            originalHash: hash
          });
        },
        mimeType,
        quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
}

async function optimizePDF(file: File): Promise<OptimizedFile | null> {
  const hash = await calculateHash(file);
  
  if (file.size <= 10 * 1024 * 1024) {
    return {
      file,
      type: file.type,
      name: file.name,
      originalHash: hash
    };
  }

  console.warn('PDF optimization for files > 10MB will be implemented in a future update');
  
  return {
    file,
    type: file.type,
    name: file.name,
    originalHash: hash
  };
}

export async function optimizeFile(file: File): Promise<OptimizedFile | null> {
  try {
    if (file.type.startsWith('image/')) {
      return await optimizeImage(file);
    } else if (file.type === 'application/pdf') {
      return await optimizePDF(file);
    }
    
    return null;
  } catch (error) {
    console.error('Error optimizing file:', error);
    return null;
  }
}
