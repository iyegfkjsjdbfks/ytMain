import React, { useRef, useState, FC, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { CloudArrowUpIcon, VideoCameraIcon, EyeIcon, GlobeAltIcon, LockClosedIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

import TabsList, { Tabs } from '../components/ui/Tabs';
import { UnifiedButton } from '../components/ui/UnifiedButton';

interface UploadedFile {
 file: File;
 preview: string;
 progress: number;
 status: 'uploading' | 'processing' | 'completed' | 'error'
}

interface VideoMetadata {
 title: string;
 description: string;
 visibility: 'public' | 'unlisted' | 'private';
 category: string;
 tags: string;
 thumbnail: string | null;
 monetization: boolean;
 commentsEnabled: boolean;
 ageRestriction: boolean
}

const UploadPage: React.FC = () => {
 return null;
 const navigate = useNavigate();
 const fileInputRef = useRef<HTMLInputElement>(null);
 const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
 const [activeTab, setActiveTab] = useState('details');
 const [metadata, setMetadata] = useState<VideoMetadata>({
 title: '',
 description: '',
 visibility: 'public',
 category: 'Entertainment',
 tags: [],
 thumbnail: null,
 monetization: false,
 commentsEnabled: true,
 ageRestriction: false });
 // const [tagInput, setTagInput] = useState<string>(''); // Commented out as unused

 const categories = [
 'Entertainment', 'Education', 'Gaming', 'Music', 'News & Politics',
 'Science & Technology', 'Sports', 'Travel & Events', 'People & Blogs',
 'Comedy', 'Film & Animation', 'Autos & Vehicles'];

 const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
 const file = event.target.files?.[0];
 if (!file) {
return;
}

 // Validate file type
 if (!file.type.startsWith('video/')) {
 alert('Please select a video file');
 return;
 }

 // Validate file size (max 2GB for demo)
 if (file.size > 2 * 1024 * 1024 * 1024) {
 alert('File size must be less than 2GB');
 return;
 }

 const preview = URL.createObjectURL(file);
 const newFile: UploadedFile = {
 file,
 preview,
 progress: 0,
 status: 'uploading' };

 setUploadedFile(newFile);
 setMetadata(prev => ({
 ...prev as any,
 title: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
 }));

 // Simulate upload progress
 simulateUpload(newFile);
 };

 const simulateUpload = (_file: UploadedFile) => {
 const interval = setInterval((() => {
 setUploadedFile(prev => {
 if (!prev) {
return null;
}

 const newProgress = prev.progress + Math.random() * 10;

 if (newProgress >= 100) {
 clearInterval(interval);
 return {
 ...prev) as any,
 progress: 100,
 status: 'processing' }
 return {
 ...prev as any,
 progress: newProgress }});
 }, 200);

 // Simulate processing completion
 setTimeout((() => {
 setUploadedFile(prev => prev ? {
 ...prev) as any,
 status: 'completed' } : null);
 }, 5000);
 };

 const handleDragOver = (event: React.DragEvent) => {
 event.preventDefault();
 };

 const handleDrop = (event: React.DragEvent) => {
 event.preventDefault();
 const file = event.dataTransfer.files[0];
 if (file) {
 // Create a proper FileList-like object
 const fileList = {
 0: file,
 length: 1,
 item: (index) => index === 0 ? file : null,
 *[Symbol.iterator] () {
 yield file;
 } 
 } as FileList;

 const fakeEvent = {
 target: { files: fileList },
 currentTarget: { files: fileList },
 preventDefault: () => {},
 stopPropagation: () => {},
 nativeEvent: new Event('change'),
 bubbles: false,
 cancelable: false,
 defaultPrevented: false,
 eventPhase: 0,
 isTrusted: false,
 timeStamp: Date.now(),
 type: "change",
 persist: () => {},
 isDefaultPrevented: () => false,
 isPropagationStopped: () => false } as React.ChangeEvent<HTMLInputElement>;
 handleFileSelect(fakeEvent);
 };

 const removeTag = (tagToRemove) => {
 setMetadata(prev => ({
 ...prev as any,
 tags: prev.tags.filter((tag) => tag !== tagToRemove) }));
 };

 const handlePublish = () => {
 if (!uploadedFile || uploadedFile.status !== 'completed') {
 alert('Please wait for the video to finish processing');
 return;
 }

 if (!metadata.title.trim()) {
 alert('Please enter a title for your video');
 return;
 }

 // Simulate publishing
 alert('Video published successfully!');
 navigate('/studio');
 };

 const getVisibilityIcon = (visibility) => {
 switch (visibility) {
 case 'public': return <GlobeAltIcon className={"w}-4 h-4" />;
 case 'unlisted': return <EyeIcon className={"w}-4 h-4" />;
 case 'private': return <LockClosedIcon className={"w}-4 h-4" />;
 default: return <GlobeAltIcon className={"w}-4 h-4" />
 };

 return (
 <div className={"min}-h-screen bg-gray-50 dark:bg-gray-900">
 <div className={"max}-w-6xl mx-auto p-6">
 {/* Header */}
 <div className={"fle}x items-center justify-between mb-8">
 <div className={"fle}x items-center space-x-3">
 <VideoCameraIcon className={"w}-8 h-8 text-red-600" />
 <h1 className={"text}-3xl font-bold text-gray-900 dark:text-white">
 Upload Video
// FIXED:  </h1>
// FIXED:  </div>

 <UnifiedButton>
 variant="ghost" />
// FIXED:  onClick={() => navigate('/studio')}
 >
 <XMarkIcon className={"w}-5 h-5 mr-2" />
 Cancel
// FIXED:  </UnifiedButton>
// FIXED:  </div>

 <div className={"gri}d grid-cols-1 lg:grid-cols-3 gap-8">
 {/* Upload Area */}
 <div className={"lg}:col-span-2">
 {!uploadedFile ? (
 <div>
// FIXED:  className={"border}-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors cursor-pointer"
 onDragOver={handleDragOver}
 onDrop={handleDrop} />
// FIXED:  onClick={() => fileInputRef.current?.click()}
 >
 <CloudArrowUpIcon className={"w}-16 h-16 text-gray-400 mx-auto mb-4" />
 <h3 className={"text}-xl font-semibold text-gray-900 dark:text-white mb-2">
 Select files to upload
// FIXED:  </h3>
 <p className={"text}-gray-600 dark:text-gray-400 mb-4">
 Or drag and drop video files
// FIXED:  </p>
 <UnifiedButton variant="primary">
 Select Files
// FIXED:  </UnifiedButton>
 <input>
 ref={fileInputRef}
// FIXED:  type="file"
 accept="video/*" />
// FIXED:  onChange={(e) => handleFileSelect(e)}
// FIXED:  className={"hidden}"
 />
 <p className={"text}-sm text-gray-500 dark:text-gray-400 mt-4">
 Your videos will be private until you publish them.
// FIXED:  </p>
// FIXED:  </div>
 ) : (
 <div className={"bg}-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
 {/* Upload Progress */}
 <div className={"mb}-6">
 <div className={"fle}x items-center space-x-4 mb-4">
 <video>
// FIXED:  src={uploadedFile.preview}
// FIXED:  className={"w}-24 h-14 object-cover rounded"
 controls={false} />
 />
 <div className={"flex}-1">
 <h3 className={"font}-medium text-gray-900 dark:text-white">
 {uploadedFile.file.name}
// FIXED:  </h3>
 <p className={"text}-sm text-gray-600 dark:text-gray-400">
 {(uploadedFile.file.size / (1024 * 1024)).toFixed(1)} MB
// FIXED:  </p>
// FIXED:  </div>
 <div className={"fle}x items-center space-x-2">
 {uploadedFile.status === 'completed' && (
 <CheckCircleIcon className={"w}-6 h-6 text-green-500" />
 )}
 <span className={"text}-sm font-medium text-gray-900 dark:text-white">
 {uploadedFile.status === 'uploading' && 'Uploading...'}
 {uploadedFile.status === 'processing' && 'Processing...'}
 {uploadedFile.status === 'completed' && 'Ready to publish'}
 {uploadedFile.status === 'error' && 'Upload failed'}
// FIXED:  </span>
// FIXED:  </div>
// FIXED:  </div>

 {uploadedFile.status !== 'completed' && (
 <div className={"w}-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
 <div>
// FIXED:  className={"bg}-red-600 h-2 rounded-full transition-all duration-300"
// FIXED:  style={{ width: `${uploadedFile.progress}%` } />
 />
// FIXED:  </div>
 )}
// FIXED:  </div>

 {/* Video Details Form */}
 <Tabs value={activeTab} onValueChange={setActiveTab}>
 <TabsList className={"mb}-6">
 <TabsTrigger value="details">Details</TabsTrigger>
 <TabsTrigger value="visibility">Visibility</TabsTrigger>
 <TabsTrigger value="monetization">Monetization</TabsTrigger>
// FIXED:  </TabsList>

 <TabsContent value="details" className={"space}-y-6">
 <div>
 <label htmlFor="video-title" className={"bloc}k text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
 Title (required)
// FIXED:  </label>
 <input>
// FIXED:  type="text"
// FIXED:  id="video-title"
// FIXED:  value={metadata.title} />
// FIXED:  onChange={(e) => setMetadata(prev => ({ ...prev as any, title: e.target.value }))}
// FIXED:  className={"w}-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
// FIXED:  placeholder="Add a title that describes your video"
 maxLength={100}
 />
 <p className={"text}-sm text-gray-500 dark:text-gray-400 mt-1">
 {metadata.title.length}/100
// FIXED:  </p>
// FIXED:  </div>

 <div>
 <label htmlFor="video-description" className={"bloc}k text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
 Description
// FIXED:  </label>
 <textarea>
// FIXED:  id="video-description"
// FIXED:  value={metadata.description} />
// FIXED:  onChange={(e) => setMetadata(prev => ({ ...prev as any, description: e.target.value }))}
 rows={6}
// FIXED:  className={"w}-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
// FIXED:  placeholder="Tell viewers about your video"
 maxLength={5000}
 />
 <p className={"text}-sm text-gray-500 dark:text-gray-400 mt-1">
 {metadata.description.length}/5000
// FIXED:  </p>
// FIXED:  </div>

 <div>
 <label htmlFor="video-category" className={"bloc}k text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
 Category
// FIXED:  </label>
 <select>
// FIXED:  id="video-category"
// FIXED:  value={metadata.category} />
// FIXED:  onChange={(e) => setMetadata(prev => ({ ...prev as any, category: e.target.value }))}
// FIXED:  className={"w}-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
 >
 {categories.map((category) => (
 <option key={category} value={category}>
 {category}
// FIXED:  </option>
 ))}
// FIXED:  </select>
// FIXED:  </div>

 <div>
 <label htmlFor="video-tags" className={"bloc}k text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
 Tags
// FIXED:  </label>
 <div className={"fle}x flex-wrap gap-2 mb-2">
 {metadata.tags.map((tag) => (
 <span>
 key={tag}
// FIXED:  className={"inline}-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"/>
 {tag}
 <button />
// FIXED:  onClick={() => removeTag(tag)}
// FIXED:  className={"ml}-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
 >
 <XMarkIcon className={"w}-4 h-4" />
// FIXED:  </button>
// FIXED:  </span>
 ))}
// FIXED:  </div>
// FIXED:  </div>

 <div>
 <h3 className={"text}-lg font-medium text-gray-900 dark:text-white mb-4">
 Choose when to publish and who can see your video
// FIXED:  </h3>

 <div className={"space}-y-3">
 {[
 { value: 'public',
 label: 'Public', description: 'Anyone can search for and view' },
 { value: 'unlisted',
 label: 'Unlisted', description: 'Anyone with the link can view' },
 { value: 'private',
 label: 'Private', description: 'Only you can view' }].map((option) => (
 <label>
 key={option.value}
// FIXED:  className={"fle}x items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"/>
 <input>
// FIXED:  type="radio"
// FIXED:  name="visibility"
// FIXED:  value={option.value}
// FIXED:  checked={metadata.visibility === option.value} />
// FIXED:  onChange={(e) => setMetadata(prev => ({ ...prev as any, visibility: e.target.value}))}
// FIXED:  className={"mr}-3"
 />
 <div className={"fle}x items-center space-x-3">
 {getVisibilityIcon(option.value)}
 <div>
 <p className={"font}-medium text-gray-900 dark:text-white">
 {option.label}
// FIXED:  </p>
 <p className={"text}-sm text-gray-600 dark:text-gray-400">
 {option.description}
// FIXED:  </p>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </label>
 ))}
// FIXED:  </div>
// FIXED:  </div>

 <div className={"space}-y-4">
 <label htmlFor="comments-enabled" className={"fle}x items-center text-gray-900 dark:text-white">
 <input>
// FIXED:  type="checkbox"
// FIXED:  id="comments-enabled"
// FIXED:  checked={metadata.commentsEnabled} />
// FIXED:  onChange={(e) => setMetadata(prev => ({ ...prev as any, commentsEnabled: e.target.checked }))}
// FIXED:  className={"mr}-3"
 />
 Allow comments
// FIXED:  </label>

 <label htmlFor="age-restriction" className={"fle}x items-center">
 <input>
// FIXED:  type="checkbox"
// FIXED:  id="age-restriction"
// FIXED:  checked={metadata.ageRestriction} />
// FIXED:  onChange={(e) => setMetadata(prev => ({ ...prev as any, ageRestriction: e.target.checked }))}
// FIXED:  className={"mr}-3"
 />
 <span className={"text}-gray-900 dark:text-white">Age restriction (18+)</span>
// FIXED:  </label>
// FIXED:  </div>
// FIXED:  </TabsContent>

 <TabsContent value="monetization" className={"space}-y-6">
 <div>
 <h3 className={"text}-lg font-medium text-gray-900 dark:text-white mb-4">
 Monetization
// FIXED:  </h3>

 <label htmlFor="monetization-enabled" className={"fle}x items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
 <input>
// FIXED:  type="checkbox"
// FIXED:  id="monetization-enabled"
// FIXED:  checked={metadata.monetization} />
// FIXED:  onChange={(e) => setMetadata(prev => ({ ...prev as any, monetization: e.target.checked }))}
// FIXED:  className={"mr}-3"
 />
 <p className={"font}-medium text-gray-900 dark:text-white">
 Enable monetization
// FIXED:  </p>
 <p className={"text}-sm text-gray-600 dark:text-gray-400">
 Allow ads to be shown on your video
// FIXED:  </p>
// FIXED:  </label>
// FIXED:  </div>
// FIXED:  </TabsContent>
// FIXED:  </Tabs>
// FIXED:  </div>
 )}
// FIXED:  </div>

 {/* Sidebar */}
 <div className={"space}-y-6">
 {uploadedFile && (
 <div className={"bg}-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
 <h3 className={"text}-lg font-medium text-gray-900 dark:text-white mb-4">
 Video Preview
// FIXED:  </h3>
 <video>
// FIXED:  src={uploadedFile.preview}
 controls
// FIXED:  className={"w}-full rounded-lg" />
 />
// FIXED:  </div>
 )}

 <div className={"bg}-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
 <h3 className={"text}-lg font-medium text-gray-900 dark:text-white mb-4">
 Publish Options
// FIXED:  </h3>

 <div className={"space}-y-4">
 <UnifiedButton>
 variant="primary"
 fullWidth />
// FIXED:  onClick={(e) => handlePublish(e)}
// FIXED:  disabled={!uploadedFile || uploadedFile.status !== 'completed' || !metadata.title.trim()}
 >
 Publish
// FIXED:  </UnifiedButton>

 <UnifiedButton variant="outline" fullWidth>
 Save as Draft
// FIXED:  </UnifiedButton>

 <UnifiedButton variant="ghost" fullWidth>
 Schedule for Later
// FIXED:  </UnifiedButton>
// FIXED:  </div>
// FIXED:  </div>

 <div className={"bg}-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
 <h3 className={"text}-lg font-medium text-gray-900 dark:text-white mb-4">
 Upload Tips
// FIXED:  </h3>
 <ul className={"text}-sm text-gray-600 dark:text-gray-400 space-y-2">
 <li>• Use a clear, descriptive title</li>
 <li>• Add relevant tags to help people find your video</li>
 <li>• Choose an eye-catching thumbnail</li>
 <li>• Write a detailed description</li>
 <li>• Select the appropriate category</li>
// FIXED:  </ul>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 );
};

export default UploadPage;
