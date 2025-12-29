
/**
 * Maps Firebase Auth error codes (SDK & REST API) to human-friendly messages.
 */
export const getAuthErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    // SDK Codes
    'auth/popup-closed-by-user': 'Sign-in cancelled. Please try again.',
    'auth/popup-blocked': 'Pop-up blocked. Please enable pop-ups for this site.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/email-already-in-use': 'This email is already registered.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/invalid-credential': 'Invalid login credentials.',
    
    // REST API Raw Codes
    'INVALID_LOGIN_CREDENTIALS': 'The email or password you entered is incorrect.',
    'EMAIL_NOT_FOUND': 'No account found with this email. Would you like to sign up instead?',
    'INVALID_PASSWORD': 'The password you entered is incorrect.',
    'USER_DISABLED': 'This account has been disabled for security reasons.',
    'WEAK_PASSWORD': 'Your password is too weak. Use at least 8 characters.',
    'EMAIL_EXISTS': 'This email is already registered. Please sign in instead.',
    'TOO_MANY_ATTEMPTS_TRY_LATER': 'Too many failed attempts. Please try again in a few minutes.',
  };
  
  // Clean the error code in case it's a full error message
  const cleanCode = errorCode.includes(':') ? errorCode.split(':')[0] : errorCode;

  if (errorCode.includes('NotAllowedError')) {
    return 'Permission denied for authentication. Please check your browser settings.';
  }

  return errorMessages[cleanCode] || errorMessages[errorCode] || 'An error occurred. Please try again.';
};
