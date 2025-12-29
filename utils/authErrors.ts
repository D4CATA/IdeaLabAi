
/**
 * Maps Firebase Auth error codes to human-friendly messages.
 */
export const getAuthErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    'auth/popup-closed-by-user': 'Sign-in cancelled. Please try again.',
    'auth/popup-blocked': 'Pop-up blocked. Please enable pop-ups for this site.',
    'auth/cancelled-popup-request': 'Another sign-in is in progress.',
    'auth/operation-not-allowed': 'Google sign-in is not enabled in Firebase.',
    'auth/unauthorized-domain': 'This domain is not authorized for sign-in.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/email-already-in-use': 'This email is already registered.',
    'auth/weak-password': 'Password is too weak.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/requires-recent-login': 'Please re-authenticate to perform this action.',
    'auth/invalid-credential': 'Invalid login credentials.',
    'auth/internal-error': 'Internal server error. Please try again.',
  };
  
  // Also handle raw messages or substrings if needed
  if (errorCode.includes('NotAllowedError')) {
    return 'Permission denied for authentication. Please check your browser settings.';
  }

  return errorMessages[errorCode] || 'An error occurred. Please try again.';
};
