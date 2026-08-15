/**
 * Formats user display names cleanly by stripping out any digits/numbers
 * and capitalizing first and last name (e.g. "dilhorayashvi1228" -> "Dilhora Yashvi").
 */
export const formatCleanName = (name?: string, email?: string): string => {
  if (name && name.trim()) {
    // Strip digits and non-alphabetic chars except spaces/hyphens
    const clean = name.replace(/[0-9]/g, '').trim();
    if (clean.length > 0) {
      return clean
        .split(/\s+/)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ');
    }
  }
  if (email) {
    const raw = email.split('@')[0].replace(/[0-9]/g, '').trim();
    if (raw.length > 0) {
      return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
    }
  }
  return 'User';
};

export const sanitizeNameInput = (text: string): string => {
  // Strip numbers so users can only enter letters, spaces, hyphens, or apostrophes
  return text.replace(/[^a-zA-Z\s'-]/g, '');
};
