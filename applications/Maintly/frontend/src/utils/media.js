/**
 * Utility to resolve and construct absolute or proxy-compatible URLs for uploaded media.
 */
export function getMediaUrl(path) {
  if (!path) return '';
  if (typeof path !== 'string') return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }

  // Ensure leading slash
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // If in dev with Vite proxy, '/uploads/...' works directly,
  // but if rendered or accessed across domains, use backend port 5002
  const backendBase = import.meta.env.VITE_BACKEND_URL || (window.location.port === '3002' ? '' : 'http://localhost:5002');
  return `${backendBase}${cleanPath}`;
}

export function isImageFile(filename = '', mimeType = '') {
  if (mimeType && mimeType.startsWith('image/')) return true;
  const imageExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
  return imageExts.some(ext => filename.toLowerCase().endsWith(ext));
}

export function isPdfFile(filename = '', mimeType = '') {
  if (mimeType === 'application/pdf') return true;
  return filename.toLowerCase().endsWith('.pdf');
}
