/**
 * Safely copy text to user's clipboard without throwing NotAllowedError
 * Supports modern Clipboard API with fallback to execCommand for unfocused documents/iframes.
 */
export async function safeCopyText(text: string): Promise<boolean> {
  if (!text) return false;

  // Attempt standard Clipboard API
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback if document is unfocused or permissions denied
  }

  // Fallback using temporary textarea
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    
    textArea.focus();
    textArea.select();
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}
