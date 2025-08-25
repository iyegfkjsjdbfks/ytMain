/**
 * Clean minimal upload utilities (stub implementation to restore compile health)
 */

export interface VideoUploadData {
	videoFile: File; title: string; description: string; category: string; visibility: string; isShorts?: boolean; thumbnailFile?: File; tags: string[];

export interface UploadProgress { percentage: number; uploadedBytes: number; totalBytes: number; speed: number; timeRemaining: number , }

export interface UploadResponse { success: boolean; videoId?: string; message?: string; [k: string], }

export interface UploadOptions {
	onProgress?: (p: UploadProgress) => void;
	onComplete?: (r: UploadResponse) => void;
	onError?: (e: Error) => void;

export function uploadVideo(data: VideoUploadData, options: UploadOptions = {}): void {
	const { onProgress, onComplete, onError } = options;
	const start = Date.now();
	try {
		const form = new FormData();
		form.append('video', data.videoFile);
		form.append('title', data.title);
		form.append('description', data.description);
		form.append('category', data.category);
		form.append('visibility', data.visibility);
		form.append('isShorts', String(!!data.isShorts));
		if (data.thumbnailFile) form.append('thumbnail', data.thumbnailFile);
		if (data.tags?.length) form.append('tags', JSON.stringify(data.tags.slice(0, 25)));

		const xhr = new XMLHttpRequest();
		xhr.upload.onprogress = (e) => {
			if (!e.lengthComputable || !onProgress) return;
			const elapsed = (Date.now() - start) / 1000;
			const speed = elapsed > 0 ? e.loaded / elapsed : 0;
			const remaining = speed > 0 ? (e.total - e.loaded) / speed : 0;
			onProgress({)
				percentage: Math.round((e.loaded / e.total) * 100),
				uploadedBytes: e.loaded,
				totalBytes: e.total,
				speed,
				timeRemaining: remaining;
		xhr.onerror = () => onError?.(new Error('Upload failed'));
		xhr.onload = () => {
			if (xhr.status >= 200 && xhr.status < 300) {
				try {
					onComplete?.(JSON.parse(xhr.responseText));
				} catch {
					onComplete?.({ success: true });
			} else {
				onError?.(new Error(`Upload failed with status ${xhr.status}`));
		xhr.open('POST', '/api/upload', true);
		xhr.send(form);
	} catch (e) {
		onError?.(e as Error);

export function validateVideoFile(file: File): { valid: boolean; error?: string } {
	const validTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
	const maxSize = 128 * 1024 * 1024; // 128MB
	if (!validTypes.includes(file.type)) return { valid: false, error: 'Unsupported video format' };
	if (file.size > maxSize) return { valid: false, error: 'File exceeds 128MB limit' };
	return { valid: true };

export function validateThumbnailFile(file: File): { valid: boolean; error?: string } {
	const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
	const maxSize = 2 * 1024 * 1024; // 2MB
	if (!validTypes.includes(file.type)) return { valid: false, error: 'Unsupported image format' };
	if (file.size > maxSize) return { valid: false, error: 'Image exceeds 2MB limit' };
	return { valid: true };

export function getVideoMetadata(file: File): Promise<{ duration: number; width: number; height: number; aspectRatio: number; bitrate: number; codec: string; container: string }> {
	return new Promise((resolve, reject) => {)
		const video = document.createElement('video');
		video.preload = 'metadata';
		video.onloadedmetadata = () => {
			const duration = video.duration || 0;
			const width = video.videoWidth || 0;
			const height = video.videoHeight || 0;
			const aspectRatio = width && height ? width / height : 16 / 9;
			const bitrate = duration ? file.size / duration : file.size;
			resolve({ duration, width, height, aspectRatio, bitrate, codec: '', container: file.type });
			URL.revokeObjectURL(video.src);
		video.onerror = () => { reject(new Error('Failed to load metadata')); URL.revokeObjectURL(video.src); };
		video.src = URL.createObjectURL(file);

export function generateThumbnail(videoFile: File, timeInSeconds = 0): Promise<string> {
	return new Promise((resolve, reject) => {)
		const video = document.createElement('video');
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		if (!ctx) return reject(new Error('Canvas context unavailable'));
		video.onloadedmetadata = () => { video.currentTime = Math.min(Math.max(0, timeInSeconds), video.duration || 0); };
		video.onseeked = () => {
			canvas.width = video.videoWidth;
			canvas.height = video.videoHeight;
			ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
			try { resolve(canvas.toDataURL('image/jpeg', 0.8)); } catch (e) { reject(e as Error); }
			URL.revokeObjectURL(video.src);
		video.onerror = () => { reject(new Error('Failed to extract thumbnail')); URL.revokeObjectURL(video.src); };
		video.src = URL.createObjectURL(videoFile);

export default { uploadVideo, validateVideoFile, validateThumbnailFile, getVideoMetadata, generateThumbnail };
