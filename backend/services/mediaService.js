const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');
const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const config = require('../config');

class MediaService {
  constructor() {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: config.cloudinary.cloudName,
      api_key: config.cloudinary.apiKey,
      api_secret: config.cloudinary.apiSecret
    });

    this.allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    this.allowedVideoTypes = ['video/mp4', 'video/mov', 'video/avi'];
    this.maxImageSize = 10 * 1024 * 1024; // 10MB
    this.maxVideoSize = 100 * 1024 * 1024; // 100MB
    this.maxVideoDuration = 30; // 30 seconds
  }

  async initialize() {
    try {
      console.log('📸 Media service initialized');
      return true;
    } catch (error) {
      console.error('Media service initialization failed:', error);
      return false;
    }
  }

  // Upload image with optimization
  async uploadImage(file, options = {}) {
    try {
      const {
        folder = 'kiambu-classifieds',
        transformation = 'auto',
        quality = 'auto',
        format = 'auto'
      } = options;

      // Validate file
      if (!this.allowedImageTypes.includes(file.mimetype)) {
        throw new Error('Invalid image type');
      }

      if (file.size > this.maxImageSize) {
        throw new Error('Image too large');
      }

      // Optimize image before upload
      const optimizedBuffer = await this.optimizeImage(file.buffer);

      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            transformation: [
              { quality, fetch_format: format },
              { width: 1200, height: 800, crop: 'limit' },
              { overlay: 'kiambu-classifieds:watermark', opacity: 20, position: 'south_east' }
            ],
            eager: [
              { width: 400, height: 300, crop: 'fill' },
              { width: 800, height: 600, crop: 'fill' }
            ],
            eager_async: true,
            eager_notification_url: `${config.baseUrl}/api/media/notification`
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        const readable = new Readable();
        readable._read = () => {};
        readable.push(optimizedBuffer);
        readable.push(null);
        readable.pipe(uploadStream);
      });

      return {
        publicId: result.public_id,
        url: result.secure_url,
        thumbnail: result.eager?.[0]?.secure_url || result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes
      };
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  }

  // Upload video with compression
  async uploadVideo(file, options = {}) {
    try {
      const {
        folder = 'kiambu-classifieds/videos',
        maxDuration = this.maxVideoDuration
      } = options;

      // Validate file
      if (!this.allowedVideoTypes.includes(file.mimetype)) {
        throw new Error('Invalid video type');
      }

      if (file.size > this.maxVideoSize) {
        throw new Error('Video too large');
      }

      // Compress video before upload
      const compressedBuffer = await this.compressVideo(file.buffer, maxDuration);

      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'video',
            folder,
            transformation: [
              { quality: 'auto', fetch_format: 'mp4' },
              { width: 640, height: 480, crop: 'limit' }
            ],
            eager: [
              { width: 320, height: 240, crop: 'fill', quality: 'auto' }
            ],
            eager_async: true,
            eager_notification_url: `${config.baseUrl}/api/media/notification`
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        const readable = new Readable();
        readable._read = () => {};
        readable.push(compressedBuffer);
        readable.push(null);
        readable.pipe(uploadStream);
      });

      return {
        publicId: result.public_id,
        url: result.secure_url,
        thumbnail: result.thumbnail_url,
        duration: result.duration,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes
      };
    } catch (error) {
      console.error('Video upload error:', error);
      throw error;
    }
  }

  // Optimize image using Sharp
  async optimizeImage(buffer) {
    try {
      return await sharp(buffer)
        .resize(1200, 800, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80, progressive: true })
        .toBuffer();
    } catch (error) {
      console.error('Image optimization error:', error);
      return buffer; // Return original if optimization fails
    }
  }

  // Compress video using FFmpeg
  async compressVideo(buffer, maxDuration) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      
      ffmpeg()
        .input(buffer)
        .inputFormat('mp4')
        .duration(maxDuration)
        .videoCodec('libx264')
        .audioCodec('aac')
        .size('640x480')
        .videoBitrate('500k')
        .audioBitrate('128k')
        .fps(30)
        .outputFormat('mp4')
        .on('error', reject)
        .on('end', () => resolve(Buffer.concat(chunks)))
        .pipe()
        .on('data', chunk => chunks.push(chunk));
    });
  }

  // Generate thumbnail from video
  async generateThumbnail(videoUrl, time = '00:00:01') {
    try {
      const result = await cloudinary.uploader.explicit(videoUrl, {
        type: 'upload',
        eager: [
          { width: 320, height: 240, crop: 'fill', quality: 'auto' }
        ]
      });
      
      return result.eager[0].secure_url;
    } catch (error) {
      console.error('Thumbnail generation error:', error);
      return null;
    }
  }

  // Delete media from Cloudinary
  async deleteMedia(publicId, resourceType = 'image') {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType
      });
      
      return result.result === 'ok';
    } catch (error) {
      console.error('Media deletion error:', error);
      return false;
    }
  }

  // Transform image on-the-fly
  async transformImage(publicId, transformations = {}) {
    try {
      const url = cloudinary.url(publicId, {
        transformation: transformations
      });
      
      return url;
    } catch (error) {
      console.error('Image transformation error:', error);
      return null;
    }
  }

  // Get media info
  async getMediaInfo(publicId, resourceType = 'image') {
    try {
      const result = await cloudinary.api.resource(publicId, {
        resource_type: resourceType
      });
      
      return {
        publicId: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes,
        duration: result.duration,
        createdAt: result.created_at
      };
    } catch (error) {
      console.error('Get media info error:', error);
      return null;
    }
  }

  // Batch upload multiple images
  async uploadMultipleImages(files, options = {}) {
    try {
      const uploadPromises = files.map(file => this.uploadImage(file, options));
      const results = await Promise.all(uploadPromises);
      
      return results;
    } catch (error) {
      console.error('Batch upload error:', error);
      throw error;
    }
  }

  // Create image collage
  async createCollage(publicIds, options = {}) {
    try {
      const {
        width = 800,
        height = 600,
        columns = 2,
        rows = 2
      } = options;

      const result = await cloudinary.image(publicIds.join(','), {
        transformation: [
          { width, height, crop: 'fill' },
          { overlay: 'kiambu-classifieds:grid', width, height }
        ]
      });

      return result;
    } catch (error) {
      console.error('Collage creation error:', error);
      return null;
    }
  }

  // Validate file
  validateFile(file, type = 'image') {
    const allowedTypes = type === 'image' ? this.allowedImageTypes : this.allowedVideoTypes;
    const maxSize = type === 'image' ? this.maxImageSize : this.maxVideoSize;
    
    if (!allowedTypes.includes(file.mimetype)) {
      return { valid: false, error: 'Invalid file type' };
    }
    
    if (file.size > maxSize) {
      return { valid: false, error: 'File too large' };
    }
    
    return { valid: true };
  }

  // Health check
  async healthCheck() {
    try {
      // Test Cloudinary connection
      await cloudinary.api.ping();
      return true;
    } catch (error) {
      console.error('Media service health check failed:', error);
      return false;
    }
  }

  // Get upload statistics
  async getUploadStats() {
    try {
      const result = await cloudinary.api.usage();
      return {
        plan: result.plan,
        objects: result.objects,
        bandwidth: result.bandwidth,
        storage: result.storage,
        requests: result.requests
      };
    } catch (error) {
      console.error('Get upload stats error:', error);
      return null;
    }
  }
}

module.exports = MediaService; 