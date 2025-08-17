// Anonymous session management utility
export const generateAnonymousSessionId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  return `anon_${timestamp}_${random}`;
};

export const getOrCreateAnonymousSession = (): string => {
  const storageKey = 'anonymous_session_id';
  
  // Check if we already have a session ID
  let sessionId = sessionStorage.getItem(storageKey);
  
  if (!sessionId) {
    // Generate new session ID
    sessionId = generateAnonymousSessionId();
    sessionStorage.setItem(storageKey, sessionId);
    
    // Also store in localStorage for persistence across tabs
    localStorage.setItem(storageKey, sessionId);
  }
  
  return sessionId;
};

export const clearAnonymousSession = (): void => {
  sessionStorage.removeItem('anonymous_session_id');
  localStorage.removeItem('anonymous_session_id');
};

// Get browser fingerprint for additional tracking (optional)
export const getBrowserFingerprint = (): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Anonymous user fingerprint', 2, 2);
  }
  
  const fingerprint = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screen: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    canvas: canvas.toDataURL()
  };
  
  return btoa(JSON.stringify(fingerprint)).substring(0, 16);
};