/**
 * Safe clipboard copy utility that handles iframe permissions,
 * unfocused document errors, and provides a fallback using a temporary textarea.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !text) {
    return false;
  }

  // 1. Try modern navigator.clipboard only if document has focus
  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      if (typeof document.hasFocus === 'function' && document.hasFocus()) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // Silently proceed to fallback if document is not focused or permission denied
    }
  }

  // 2. Fallback: create an off-screen textarea and execCommand('copy')
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    
    try {
      textArea.focus();
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    } catch {
      if (document.body.contains(textArea)) {
        document.body.removeChild(textArea);
      }
      return false;
    }
  } catch {
    return false;
  }
}
