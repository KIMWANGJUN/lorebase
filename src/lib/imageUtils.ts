
// src/lib/imageUtils.ts

/**
 * Validates if the file is a supported image format.
 * @param {File} file - The file to validate.
 * @returns {boolean} - True if the format is allowed, false otherwise.
 */
export const validateImageFormat = (file: File): boolean => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  return allowedTypes.includes(file.type);
};

/**
 * Validates if the file size is within the allowed limit (1MB).
 * @param {File} file - The file to validate.
 * @returns {boolean} - True if the size is within the limit, false otherwise.
 */
export const validateImageSize = (file: File): boolean => {
  const maxSize = 1024 * 1024; // 1MB
  return file.size <= maxSize;
};

/**
 * Resizes an image to a square of the target size and optimizes its file size.
 * @param {File} file - The original image file.
 * @param {number} [targetSize=512] - The target width and height of the resized image.
 * @returns {Promise<Blob | null>} A promise that resolves to the resized image Blob, or null on failure.
 */
export const resizeImage = (file: File, targetSize = 512): Promise<Blob | null> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    let objectURL: string | null = null;

    img.onload = () => {
      if (!ctx) {
        if (objectURL) URL.revokeObjectURL(objectURL);
        return reject(new Error('Failed to get canvas context.'));
      }
      try {
        canvas.width = targetSize;
        canvas.height = targetSize;
        
        const minDimension = Math.min(img.width, img.height);
        const offsetX = (img.width - minDimension) / 2;
        const offsetY = (img.height - minDimension) / 2;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, offsetX, offsetY, minDimension, minDimension, 0, 0, targetSize, targetSize);

        let quality = 0.8;
        if (file.size > 500 * 1024) quality = 0.7;
        else if (file.size > 200 * 1024) quality = 0.75;

        canvas.toBlob(
          (blob) => {
            if (objectURL) URL.revokeObjectURL(objectURL);
            resolve(blob);
          },
          'image/jpeg',
          quality
        );
      } catch (error) {
        if (objectURL) URL.revokeObjectURL(objectURL);
        reject(error);
      }
    };

    img.onerror = () => {
      if (objectURL) URL.revokeObjectURL(objectURL);
      reject(new Error('Failed to load image.'));
    };

    objectURL = URL.createObjectURL(file);
    img.src = objectURL;
  });
};

/**
 * Performs comprehensive validation for an image file.
 * @param {File | null | undefined} file - The file to validate.
 * @returns {{isValid: boolean; error: string | null}} - An object containing the validation result and an error message.
 */
export const validateImage = (file: File | null | undefined): { isValid: boolean; error: string | null } => {
  if (!file) {
    return { isValid: false, error: 'A file was not selected.' };
  }
  if (!validateImageFormat(file)) {
    return { isValid: false, error: 'Only JPEG, PNG, and WebP formats are allowed.' };
  }
  if (!validateImageSize(file)) {
    return { isValid: false, error: 'File size must be 1MB or less.' };
  }
  return { isValid: true, error: null };
};

/**
 * Validates the true MIME type of an image file by checking its magic numbers.
 * @param {File} file - The file to inspect.
 * @returns {Promise<boolean>} - A promise that resolves to true if the file signature matches a known image type.
 */
export const validateImageMimeType = (file: File): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.onloadend = (e) => {
            if (e.target?.result && e.target.result instanceof ArrayBuffer) {
                const uint = new Uint8Array(e.target.result);
                let bytes: string[] = [];
                uint.forEach((byte) => {
                    bytes.push(byte.toString(16).padStart(2, '0'));
                });
                const hex = bytes.join('').toUpperCase();
                
                const isJPEG = hex.startsWith('FFD8FF');
                const isPNG = hex.startsWith('89504E47');
                const isWEBP = hex.startsWith('52494646') && hex.endsWith('57454250');
                
                resolve(isJPEG || isPNG || isWEBP);
            } else {
                reject(new Error('Could not read file for MIME type validation.'));
            }
        };
        fileReader.onerror = () => reject(new Error('FileReader error during MIME type validation.'));
        fileReader.readAsArrayBuffer(file.slice(0, 8));
    });
};
