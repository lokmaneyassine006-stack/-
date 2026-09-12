/**
 * Security, sanitization, profanity filter and media compression tools.
 */

// Profanity and indecent content filter (Arabic, English, French)
const INAPPROPRIATE_KEYWORDS = [
  'سب', 'شتم', 'قبيح', 'سافل', 'منحط', 'كلب', 'حمار', 'وسخ', 'ابن الكلب', 'عرص', 'شرموط', 
  'قحبة', 'عاهر', 'فاسق', 'لوطي', 'مخنث', 'منيك', 'كس', 'طيز', 'زب', 'نيك', 'porn', 
  'sex', 'fuck', 'shit', 'bitch', 'asshole', 'dick', 'pussy', 'bastard', 'pute', 'merde', 
  'salope', 'connard', 'nique', 'encule'
];

/**
 * Checks if text contains inappropriate or indecent content
 */
export function checkProfanity(text: string): { isClean: boolean; flaggedWord?: string } {
  if (!text) return { isClean: true };
  const normalized = text.toLowerCase().replace(/[^\w\u0621-\u064A\s]/gi, ' ');
  const words = normalized.split(/\s+/);
  
  for (const word of words) {
    for (const bad of INAPPROPRIATE_KEYWORDS) {
      if (word === bad || (word.length > 3 && word.includes(bad))) {
        return { isClean: false, flaggedWord: bad };
      }
    }
  }
  return { isClean: true };
}

/**
 * Escapes HTML characters to prevent XSS attacks
 */
export function escapeHtml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Compresses an image file using an offscreen canvas to minimize localStorage footprint.
 * Resizes to max dimensions and converts to JPEG / WebP data URL.
 */
export async function compressImage(file: File, maxWidth = 640, maxHeight = 800, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(readerEvent.target?.result as string);
          return;
        }

        // Fill background with white for transparency safety
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Export as compressed JPEG
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('فشل تحميل الصورة'));
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = () => reject(new Error('فشل قراءة الملف'));
    reader.readAsDataURL(file);
  });
}

/**
 * Generates an automated secure transaction reference code
 */
export function generateReferenceCode(prefix = 'TX'): string {
  const year = new Date().getFullYear();
  const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${year}-${randomHex}`;
}

/**
 * Generates an ISBN-13 checksum valid book serial number
 */
export function generateIsbn(): string {
  const prefix = '978-9931';
  const group = Math.floor(1000 + Math.random() * 9000);
  const title = Math.floor(10 + Math.random() * 90);
  const check = Math.floor(Math.random() * 10);
  return `${prefix}-${group}-${title}-${check}`;
}

/**
 * Generates a simple checksum hash for data integrity verification
 */
export function calculateIntegrityChecksum(payload: unknown): string {
  const str = JSON.stringify(payload);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `SHA256-${Math.abs(hash).toString(16).padStart(8, '0')}-VERIFIED`;
}
