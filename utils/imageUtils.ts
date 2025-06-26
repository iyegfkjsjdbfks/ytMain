// Image utility functions for handling placeholders and fallbacks

export const getImageWithFallback = (
  primaryUrl: string,
  fallbackUrl?: string,
  width?: number,
  height?: number,
): string => {
  // If primary URL is already a picsum URL, return it
  if (primaryUrl.includes('picsum.photos')) {
    return primaryUrl;
  }

  // If primary URL is a placeholder API URL, convert to picsum
  if (primaryUrl.includes('/api/placeholder/')) {
    const parts = primaryUrl.split('/');
    const dimensions = parts[parts.length - 1];
    const [w, h] = dimensions?.split('x').map(Number) || [];
    return `https://picsum.photos/${w || width || 320}/${h || height || 180}?random=${Math.floor(Math.random() * 1000)}`;
  }

  // Return fallback or generate one
  if (fallbackUrl) {
    return fallbackUrl;
  }

  return `https://picsum.photos/${width || 320}/${height || 180}?random=${Math.floor(Math.random() * 1000)}`;
};

export const getVideoThumbnail = (videoId: string, width: number = 320, height: number = 180): string => {
  return `https://picsum.photos/${width}/${height}?random=${videoId}`;
};

export const getChannelAvatar = (channelId: string, size: number = 40): string => {
  return `https://picsum.photos/${size}/${size}?random=${channelId}`;
};

export const getUserAvatar = (userId: string, size: number = 40): string => {
  return `https://picsum.photos/${size}/${size}?random=user-${userId}`;
};

export const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
  const img = event.currentTarget;
  const width = img.width || 320;
  const height = img.height || 180;

  // Generate a new random fallback image
  img.src = `https://picsum.photos/${width}/${height}?random=${Date.now()}`;
};

export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

export const generatePlaceholderDataUrl = (width: number, height: number, text?: string): string => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
return '';
}

  // Fill background
  ctx.fillStyle = '#f3f4f6';
  ctx.fillRect(0, 0, width, height);

  // Add text
  if (text) {
    ctx.fillStyle = '#6b7280';
    ctx.font = `${Math.min(width, height) / 8}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, height / 2);
  }

  return canvas.toDataURL();
};

// Image optimization utilities
export const getOptimizedImageUrl = (
  originalUrl: string,
  width?: number,
  height?: number,
  quality: number = 80,
): string => {
  // For picsum photos, we can add quality and exact dimensions
  if (originalUrl.includes('picsum.photos')) {
    const url = new URL(originalUrl);
    if (width) {
url.searchParams.set('width', width.toString());
}
    if (height) {
url.searchParams.set('height', height.toString());
}
    if (quality !== 80) {
url.searchParams.set('quality', quality.toString());
}
    return url.toString();
  }

  return originalUrl;
};

// Responsive image utilities
export const getResponsiveImageSrcSet = (baseUrl: string, sizes: number[]): string => {
  return sizes
    .map(size => `${getOptimizedImageUrl(baseUrl, size)} ${size}w`)
    .join(', ');
};

export const getResponsiveImageSizes = (breakpoints: { [key: string]: string }): string => {
  return Object.entries(breakpoints)
    .map(([breakpoint, size]) => `(${breakpoint}) ${size}`)
    .join(', ');
};

// Image lazy loading utilities
export const createIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit,
): IntersectionObserver => {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  };

  return new IntersectionObserver(callback, defaultOptions);
};

// Image format detection
export const supportsWebP = (): boolean => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
};

export const supportsAvif = (): boolean => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
};

// Get the best supported image format
export const getBestImageFormat = (): 'avif' | 'webp' | 'jpg' => {
  if (supportsAvif()) {
return 'avif';
}
  if (supportsWebP()) {
return 'webp';
}
  return 'jpg';
};

// Color utilities for placeholder generation
export const generateColorFromString = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = hash % 360;
  return `hsl(${hue}, 70%, 80%)`;
};

export const getContrastColor = (backgroundColor: string): string => {
  // Simple contrast calculation - in production, use a more sophisticated algorithm
  const rgb = backgroundColor.match(/\d+/g);
  if (!rgb) {
return '#000000';
}

  const brightness = (parseInt(rgb[0] || '0') * 299 + parseInt(rgb[1] || '0') * 587 + parseInt(rgb[2] || '0') * 114) / 1000;
  return brightness > 128 ? '#000000' : '#ffffff';
};

// Image compression utilities (for upload)
export const compressImage = (
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8,
): Promise<Blob> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      canvas.toBlob(resolve as BlobCallback, 'image/jpeg', quality);
    };

    img.src = URL.createObjectURL(file);
  });
};

// Image validation utilities
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'File size too large. Please upload an image smaller than 10MB.' };
  }

  return { valid: true };
};

// Extract dominant color from image
export const extractDominantColor = (imageUrl: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = img.width;
      canvas.height = img.height;

      ctx?.drawImage(img, 0, 0);

      try {
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        if (!imageData) {
          resolve('#f3f4f6');
          return;
        }

        // Simple dominant color extraction (average)
        let r = 0, g = 0, b = 0;
        const { data } = imageData;

        for (let i = 0; i < data.length; i += 4) {
          r += data[i] || 0;
          g += data[i + 1] || 0;
          b += data[i + 2] || 0;
        }

        const pixelCount = data.length / 4;
        r = Math.round(r / pixelCount);
        g = Math.round(g / pixelCount);
        b = Math.round(b / pixelCount);

        resolve(`rgb(${r}, ${g}, ${b})`);
      } catch (error) {
        resolve('#f3f4f6');
      }
    };

    img.onerror = () => resolve('#f3f4f6');
    img.src = imageUrl;
  });
};

export default {
  getImageWithFallback,
  getVideoThumbnail,
  getChannelAvatar,
  getUserAvatar,
  handleImageError,
  preloadImage,
  generatePlaceholderDataUrl,
  getOptimizedImageUrl,
  getResponsiveImageSrcSet,
  getResponsiveImageSizes,
  createIntersectionObserver,
  supportsWebP,
  supportsAvif,
  getBestImageFormat,
  generateColorFromString,
  getContrastColor,
  compressImage,
  validateImageFile,
  extractDominantColor,
};
