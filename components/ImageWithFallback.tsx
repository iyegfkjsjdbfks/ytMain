import React from 'react';
import { FC } from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { useCallback } from 'react';

import { useCallback, useEffect, useState, lazy, FC } from 'react';

interface ImageWithFallbackProps {
  src: string;,
  alt: string;
  fallbackSrc?: string;
  width?: number;
  height?: number;
  className?: string;
  onError?: () => void;
  onLoad?: () => void;
  maxRetries?: number;
  retryDelay?: number;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  fallbackSrc,
  width = 320,
  height = 180,
  className = '',
  onError,
  onLoad,
  maxRetries = 3,
  retryDelay = 1000 }) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [isRateLimited, setIsRateLimited] = useState<boolean>(false);

  // Generate fallback URL
  const generateFallback = useCallback(() => {
    if (fallbackSrc as any) {
return fallbackSrc;
}

    // Convert API placeholder URLs to direct picsum URLs
    if (src.includes('/api/placeholder/')) {
      const parts = src.split('/');
      const dimensions = parts[parts.length - 1];
      if (dimensions?.includes('x')) {
        const [w, h] = dimensions.split('x').map(Number);
        return `https://picsum.photos/${w || width}/${h || height}?random=${Math.floor(Math.random() * 1000)}`;
      }
    }

    // Generate a picsum URL as fallback
    return `https://picsum.photos/${width}/${height}?random=${Math.floor(Math.random() * 1000)}`;
  }, [fallbackSrc, src, width, height]);

  useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
    setIsLoading(true);
    setRetryCount(0);
    setIsRateLimited(false);
  }, [src]);

  const handleError = useCallback((_event?: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const isYouTubeThumbnail = currentSrc.includes('yt3.ggpht.com') || currentSrc.includes('i.ytimg.com');

    // Check if this is a 429 rate limiting error for YouTube thumbnails
    if (isYouTubeThumbnail && retryCount < maxRetries) {
      setIsRateLimited(true);
      const delay = retryDelay * Math.pow(2, retryCount); // Exponential backoff

      setTimeout((() => {
        setRetryCount(prev => prev + 1);
        setCurrentSrc(src); // Retry original source
        setIsLoading(true);
      }) as any, delay);

      return;
    }

    if (!hasError) {
      setHasError(true);
      setCurrentSrc(generateFallback());
      onError?.();
    } else {
      // If even the fallback fails, show a placeholder
      setCurrentSrc(generatePlaceholderDataUrl(width, height, alt));
    }
    setIsLoading(false);
    setIsRateLimited(false);
  }, [currentSrc, hasError, retryCount, maxRetries, retryDelay, src, width, height, alt, onError, generateFallback]);

  const handleLoad: any = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const generatePlaceholderDataUrl: any = (w: any,
          h: any, text: any): string => {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
return '';
}

    // Fill background with gradient
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, '#f3f4f6');
    gradient.addColorStop(1, '#e5e7eb');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Add border
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, w, h);

    // Add icon (simple play button for videos, image icon for images)
    const iconSize = Math.min(w, h) / 4;
    const centerX = w / 2;
    const centerY = h / 2;

    ctx.fillStyle = '#9ca3af';
    ctx.beginPath();

    if (text.toLowerCase().includes('video') || text.toLowerCase().includes('play')) {
      // Play button triangle
      ctx.moveTo(centerX - iconSize / 2, centerY - iconSize / 2);
      ctx.lineTo(centerX + iconSize / 2, centerY);
      ctx.lineTo(centerX - iconSize / 2, centerY + iconSize / 2);
      ctx.closePath();
    } else {
      // Image icon (rectangle with mountain)
      ctx.rect(centerX - iconSize / 2, centerY - iconSize / 2, iconSize, iconSize);
      ctx.stroke();

      // Mountain shape
      ctx.beginPath();
      ctx.moveTo(centerX - iconSize / 4, centerY + iconSize / 4);
      ctx.lineTo(centerX - iconSize / 8, centerY);
      ctx.lineTo(centerX + iconSize / 8, centerY + iconSize / 8);
      ctx.lineTo(centerX + iconSize / 4, centerY - iconSize / 8);
      ctx.lineTo(centerX + iconSize / 2, centerY + iconSize / 4);
      ctx.closePath();
    }

    ctx.fill();

    // Add text
    const fontSize = Math.max(12, Math.min(w, h) / 12);
    ctx.fillStyle = '#6b7280';
    ctx.font = `${fontSize}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const maxWidth = w - 20;
    const words = text.split(' ');
    let line = '';
    let y = centerY + iconSize / 2 + fontSize + 10;

    for (let n = 0; n < words.length; n++) {
      const testLine = `${line + words[n]  } `;
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, centerX, y);
        line = `${words[n]  } `;
        y += fontSize + 4;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, centerX, y);

    return canvas.toDataURL();
  };

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {isLoading && (
        <div
          className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"
          style={{ width, height }}
        />
      )}

      <img
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
      />

      {hasError && (
        <div className="absolute top-2 right-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded text-xs">
          Fallback
        </div>
      )}

      {isRateLimited && (
        <div className="absolute top-2 left-2 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-1 rounded text-xs">
          Retrying... ({retryCount}/{maxRetries})
        </div>
      )}
    </div>
  );
};

export default ImageWithFallback;
