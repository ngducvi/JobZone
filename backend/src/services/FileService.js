const cloudinary = require('cloudinary').v2;
require('dotenv').config();

class FileService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  /**
   * Upload an image from a Blob to Cloudinary.
   * @param {Blob} blob - The Blob object to upload.
   * @param {Object} options - Additional options for the upload (e.g., folder, tags).
   * @returns {Object} - The response from Cloudinary.
   */
  async uploadFile(blob, resourceType = 'auto') {
    const buffer = Buffer.from(await blob.arrayBuffer());
  
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { 
          resource_type: resourceType,
          eager: [{ 
            width: 500,
            height: 500,
            crop: "limit"
          }],
          expires_at: Math.floor(Date.now() / 1000) + (1 * 24 * 60 * 60)
        },
        (error, result) => {
          if (error) {
            reject(JSON.stringify(error));
          } else {
            resolve(result);
          }
        }
      ).end(buffer);
    });
  };
}

module.exports = new FileService();
