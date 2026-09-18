export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg'
];

/**
 * Validates a file for upload.
 * @param {File} file
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateDocumentFile(file) {
  if (!file) {
    return { valid: false, error: 'Please select a document file to analyze.' };
  }

  const fileName = file.name.toLowerCase();
  const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext));
  const hasValidMime = file.type ? ALLOWED_MIME_TYPES.includes(file.type) : hasValidExtension;

  if (!hasValidExtension && !hasValidMime) {
    return {
      valid: false,
      error: 'Unsupported file type. Please upload a PDF, JPG, or PNG document.'
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size (${sizeInMb}MB) exceeds the 10MB limit. Please upload a smaller file.`
    };
  }

  return { valid: true };
}
