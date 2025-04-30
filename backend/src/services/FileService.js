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
   * Upload a file (image or PDF) to Cloudinary.
   * @param {Blob|Buffer} blob - The Blob or Buffer object to upload.
   * @param {Object} options - Additional options (e.g., folder, resource_type, expires_at).
   * @returns {Object} - The response from Cloudinary.
   */
  async uploadFile(blob, options = {}) {
    // Chuyển Blob thành Buffer nếu cần
    const buffer = Buffer.isBuffer(blob) ? blob : Buffer.from(await blob.arrayBuffer());

    // Mặc định options
    const defaultOptions = {
      resource_type: 'auto', // 'auto' để Cloudinary tự phát hiện (image, raw, video)
      folder: 'uploads', // Thư mục mặc định
      expires_at: null, // Không đặt expires_at mặc định
    };

    const uploadOptions = { ...defaultOptions, ...options };

    // Nếu là PDF, bỏ transformation
    if (uploadOptions.resource_type === 'raw') {
      delete uploadOptions.eager;
    } else {
      // Chỉ áp dụng transformation cho hình ảnh
      uploadOptions.eager = uploadOptions.eager || [
        {
          width: 500,
          height: 500,
          crop: 'limit',
        },
      ];
    }

    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
        if (error) {
          reject(new Error(JSON.stringify(error)));
        } else {
          resolve(result);
        }
      }).end(buffer);
    });
  }

  /**
   * Upload a PDF file to Cloudinary
   * @param {Buffer} buffer - The file buffer to upload
   * @param {string} folder - The folder to store the file in
   * @returns {Promise<Object>} - The response from Cloudinary
   */
  async uploadPDF(buffer, folder = 'cvs') {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: folder,
          format: 'pdf',
          type: 'upload',
          access_mode: 'public',
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            // Transform the URL to ensure PDF is viewable
            // Change from /raw/upload/ to /raw/upload/fl_attachment/ and ensure it ends with .pdf
            const viewableUrl = result.secure_url
              .replace('/raw/upload/', '/raw/upload/fl_attachment/')
              .replace(/\.[^/.]+$/, '.pdf');
            
            result.secure_url = viewableUrl;
            resolve(result);
          }
        }
      ).end(buffer);
    });
  }
}

module.exports = new FileService();