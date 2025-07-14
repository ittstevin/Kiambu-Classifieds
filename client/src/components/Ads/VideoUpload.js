import React, { useState, useRef } from 'react';
import { Video, Upload, Play, Pause, Volume2, VolumeX, X, Check, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const VideoUpload = ({ 
  onVideoUpload, 
  maxDuration = 30, // seconds
  maxSize = 50, // MB
  acceptedFormats = ['mp4', 'mov', 'avi', 'mkv'],
  showPreview = true
}) => {
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState('');
  
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  // Validate video file
  const validateVideo = (file) => {
    const errors = [];

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      errors.push(`File size must be less than ${maxSize}MB`);
    }

    // Check file format
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!acceptedFormats.includes(fileExtension)) {
      errors.push(`File format must be one of: ${acceptedFormats.join(', ')}`);
    }

    return errors;
  };

  // Compress video using Canvas API (basic compression)
  const compressVideo = async (file) => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      video.onloadedmetadata = () => {
        // Set canvas size (reduce quality for compression)
        const maxWidth = 640;
        const maxHeight = 480;
        let { width, height } = video;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, width, height);

        // Convert to blob with reduced quality
        canvas.toBlob((blob) => {
          const compressedFile = new File([blob], file.name, {
            type: 'video/mp4',
            lastModified: Date.now()
          });
          resolve(compressedFile);
        }, 'video/mp4', 0.6); // 60% quality
      };

      video.src = URL.createObjectURL(file);
    });
  };

  // Handle file selection
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setError('');
    setIsUploading(true);

    try {
      // Validate file
      const validationErrors = validateVideo(file);
      if (validationErrors.length > 0) {
        setError(validationErrors.join(', '));
        setIsUploading(false);
        return;
      }

      // Check video duration
      const duration = await getVideoDuration(file);
      if (duration > maxDuration) {
        setError(`Video must be shorter than ${maxDuration} seconds`);
        setIsUploading(false);
        return;
      }

      setVideoDuration(duration);

      // Compress video
      const compressedFile = await compressVideo(file);
      
      // Create preview URL
      const url = URL.createObjectURL(compressedFile);
      setVideoUrl(url);
      setVideoFile(compressedFile);

      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          toast.success('Video uploaded successfully!');
          if (onVideoUpload) {
            onVideoUpload(compressedFile);
          }
        }
      }, 100);

    } catch (err) {
      setError('Error processing video file');
      setIsUploading(false);
      console.error('Video processing error:', err);
    }
  };

  // Get video duration
  const getVideoDuration = (file) => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.onloadedmetadata = () => {
        resolve(video.duration);
      };
      video.src = URL.createObjectURL(file);
    });
  };

  // Video controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleSeek = (event) => {
    if (videoRef.current) {
      const rect = event.currentTarget.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const width = rect.width;
      const seekTime = (clickX / width) * videoDuration;
      videoRef.current.currentTime = seekTime;
    }
  };

  const removeVideo = () => {
    setVideoFile(null);
    setVideoUrl('');
    setVideoDuration(0);
    setCurrentTime(0);
    setIsPlaying(false);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {!videoFile && (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-primary-500 dark:hover:border-primary-400 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <div className="space-y-3">
            <Video className="w-12 h-12 text-gray-400 mx-auto" />
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                Upload Video
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                MP4, MOV, AVI up to {maxSize}MB, max {maxDuration}s
              </p>
            </div>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {isUploading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Uploading... {uploadProgress}%</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Upload className="w-4 h-4" />
                  <span>Choose Video</span>
                </div>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
        </div>
      )}

      {/* Video Preview */}
      {videoFile && showPreview && (
        <div className="bg-black rounded-lg overflow-hidden">
          <div className="relative">
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-64 object-cover"
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
              muted={isMuted}
            />
            
            {/* Video Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              {/* Progress Bar */}
              <div 
                className="w-full h-1 bg-gray-600 rounded-full cursor-pointer mb-3"
                onClick={handleSeek}
              >
                <div 
                  className="h-full bg-primary-500 rounded-full transition-all"
                  style={{ width: `${(currentTime / videoDuration) * 100}%` }}
                />
              </div>
              
              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={togglePlay}
                    className="text-white hover:text-primary-400 transition-colors"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                  
                  <button
                    onClick={toggleMute}
                    className="text-white hover:text-primary-400 transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  
                  <span className="text-white text-sm">
                    {formatTime(currentTime)} / {formatTime(videoDuration)}
                  </span>
                </div>
                
                <button
                  onClick={removeVideo}
                  className="text-white hover:text-red-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Info */}
      {videoFile && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Check className="w-5 h-5 text-green-600" />
              <span className="font-medium text-gray-900 dark:text-white">
                Video uploaded successfully
              </span>
            </div>
            
            <button
              onClick={removeVideo}
              className="text-gray-500 hover:text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            <p>Duration: {formatTime(videoDuration)}</p>
            <p>Size: {(videoFile.size / (1024 * 1024)).toFixed(1)}MB</p>
            <p>Format: {videoFile.name.split('.').pop().toUpperCase()}</p>
          </div>
        </div>
      )}

      {/* Upload Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          Video Upload Tips
        </h4>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Keep videos under {maxDuration} seconds for better engagement</li>
          <li>• Show the item in use or from different angles</li>
          <li>• Ensure good lighting and clear audio</li>
          <li>• Compress large files before uploading</li>
        </ul>
      </div>
    </div>
  );
};

export default VideoUpload; 