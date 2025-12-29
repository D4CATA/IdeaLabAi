
/**
 * Masks an email for privacy display.
 * @example "john.doe@example.com" -> "j***e@example.com"
 */
export const maskEmail = (email: string): string => {
  if (!email) return "";
  const [localPart, domain] = email.split("@");
  if (!localPart || !domain) return email;
  if (localPart.length <= 2) return `${localPart}***@${domain}`;
  return `${localPart[0]}***${localPart[localPart.length - 1]}@${domain}`;
};

/**
 * Generates a unique ID for React components.
 */
export const generateUUID = (): string => {
  return crypto.randomUUID();
};

/**
 * Type guard for API errors
 */
export const isRateLimitError = (error: unknown): boolean => {
  if (error && typeof error === 'object' && 'message' in error) {
    const msg = String((error as any).message).toLowerCase();
    return msg.includes('429') || msg.includes('quota') || msg.includes('limit');
  }
  return false;
};
