/**
 * File upload validation middleware
 * Validates file type, size, and other properties
 */

// Allowed image MIME types
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp'
];

// Allowed image file extensions
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

/**
 * Get file extension from filename
 */
const getFileExtension = (filename) => {
  return filename.toLowerCase().substring(filename.lastIndexOf('.'));
};

/**
 * Validate image file upload
 */
export const validateImageUpload = (req, res, next) => {
  // If no file is uploaded (optional for edit operations)
  if (!req.file) {
    return next();
  }

  const file = req.file;
  const errors = [];

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    errors.push(`File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
  }

  // Check file type by MIME type
  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    errors.push(`File type ${file.mimetype} is not allowed. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`);
  }

  // Check file extension
  const extension = getFileExtension(file.originalname);
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    errors.push(`File extension ${extension} is not allowed. Allowed extensions: ${ALLOWED_EXTENSIONS.join(', ')}`);
  }

  // Check if file has a name
  if (!file.originalname || file.originalname.trim() === '') {
    errors.push('File must have a name');
  }

  if (errors.length > 0) {
    // Delete the uploaded file if validation fails
    const fs = require('fs');
    if (file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    return res.status(400).json({
      success: false,
      message: "File validation failed",
      errors: errors
    });
  }

  next();
};

/**
 * Require file upload (for add operations)
 */
export const requireFileUpload = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "File upload is required",
      errors: ["Please upload an image file"]
    });
  }
  next();
};







