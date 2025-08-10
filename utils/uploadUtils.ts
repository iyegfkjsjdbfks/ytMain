import type { VideoUploadData } from '../types';

interface UploadProgress {
  percentage: number;
  uploadedBytes: number;
  totalBytes: number;
  speed: number; // bytes per second
  timeRemaining: number; // in seconds
}

interface UploadResponse {
  success: boolean;
  videoId?: string;
  message?: string;
  [key]: unknown;
}

interface UploadOptions {
  onProgress?: (progress: UploadProgress) => void;
  onComplete?: (response: UploadResponse) => void;
  onError?: (error: Error) => void;
}

export function uploadVideo(
  videoData: VideoUploadData,
  options: UploadOptions = {},
): void {
  const { onProgress, onComplete, onError } = options;

  if (!videoData.videoFile) {
    throw new Error('No video file provided');
  }

  const formData = new FormData();
  formData.append('video', videoData.videoFile);
  formData.append('title', videoData.title);
  formData.append('description', videoData.description);
  formData.append('category', videoData.category);
  formData.append('visibility', videoData.visibility);
  formData.append('isShorts', String(videoData.isShorts));

  if (videoData.thumbnailFile) {
    formData.append('thumbnail', videoData.thumbnailFile);
  }

  if (videoData.tags.length > 0) {
    formData.append('tags', JSON.stringify(videoData.tags));
  }

  try {
    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = {
          percentage: Math.round((event.loaded / event.total) * 100),
          uploadedBytes: event.loaded,
          totalBytes: event.total,
          speed: event.loaded / ((Date.now() - startTime) / 1000), // bytes per second
          timeRemaining: (event.total - event.loaded) / (event.loaded / ((Date.now() - startTime) / 1000)),
        };
        onProgress(progress);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const response = JSON.parse(xhr.responseText) as UploadResponse;
        if (onComplete) {
onComplete(response);
}
      } else {
        const error = new Error(`Upload failed with status ${xhr.status}`);
        if (onError) {
onError(error);
}
      }
    };

    xhr.onerror = () => {
      const error = new Error('Upload failed');
      if (onError) {
onError(error);
}
    };

    const startTime = Date.now();
    xhr.open('POST', '/api/upload', true);
    xhr.send(formData);
  } catch (error) {
    if (onError) {
onError(error as Error);
}
  }
}

export function validateVideoFile(file: File): { valid: boolean; error?: string } {
  const validTypes = [
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-ms-wmv',
    'video/x-matroska',
    'video/3gpp',
    'video/3gpp2',
  ];

  const maxSize = 128 * 1024 * 1024; // 128MB

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a video file (MP4, WebM, MOV, AVI, WMV, MKV, 3GP, etc.)',
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File is too large. Maximum size is ${maxSize / (1024 * 1024)}MB`,
    };
  }

  return { valid: true };
}

export function validateThumbnailFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 2 * 1024 * 1024; // 2MB

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload an image (JPEG, PNG, or WebP)',
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File is too large. Maximum size is ${maxSize / (1024 * 1024)}MB`,
    };
  }

  return { valid: true };
}

export function getVideoMetadata(file: File): Promise<{
  duration: number;
  width: number;
  height: number;
  aspectRatio: number;
  bitrate: number;
  codec: string;
  container: string;
}> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');

    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);

      const duration = video.duration || 0;
      const width = video.videoWidth || 0;
      const height = video.videoHeight || 0;
      const aspectRatio = width && height ? width / height : 16 / 9;
      const bitrate = file.size / (duration || 1);

      resolve({
        duration,
        width,
        height,
        aspectRatio,
        bitrate,
        codec: '', // Would require more complex extraction
        container: file.type,
      });
    };

    video.onerror = () => {
      reject(new Error('Failed to load video metadata'));
    };

    video.src = URL.createObjectURL(file);
  });
}

export function generateThumbnail(
  videoFile: File,
  timeInSeconds: number = 0,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    video.onloadedmetadata = () => {
      video.currentTime = Math.min(Math.max(0, timeInSeconds), video.duration || 0);
    };

    video.onseeked = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      try {
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(dataUrl);
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)));
      }

      URL.revokeObjectURL(video.src);
    };

    video.onerror = () => {
      reject(new Error('Failed to load video for thumbnail generation'));
      URL.revokeObjectURL(video.src);
    };

    video.src = URL.createObjectURL(videoFile);
  });
}
