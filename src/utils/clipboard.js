export const copyTextToClipboard = async (text) => {
  if (!text) {
    return false;
  }

  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (error) {
    console.warn('Navigator clipboard API failed, falling back to legacy method.', error);
  }

  // Legacy fallback using a temporary textarea element
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();

  try {
    const successful = document.execCommand('copy');
    return successful;
  } finally {
    document.body.removeChild(textarea);
  }
};

