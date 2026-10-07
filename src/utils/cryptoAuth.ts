/**
 * Secure cryptographic verification for Garam Prix Admin Control Room.
 * The raw password is NEVER stored in plain text anywhere in source code.
 * It is securely validated using SHA-256 cryptographic digest.
 */

// SHA-256 hash of the administrative access key
const ADMIN_DIGEST_HEX = 'd3ee82f9f12c2f8a4a4726e7522e82510c18ca9ee937703790382f57b0c61acb';

const ADMIN_SESSION_STORAGE_KEY = 'gp_garam_prix_admin_session_auth';

export async function verifyAdminPassword(plainTextAttempt: string): Promise<boolean> {
  if (!plainTextAttempt || typeof plainTextAttempt !== 'string') {
    return false;
  }

  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(plainTextAttempt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const calculatedHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

    return calculatedHex === ADMIN_DIGEST_HEX;
  } catch (err) {
    console.error('Cryptographic verification failure:', err);
    return false;
  }
}

export function saveAdminSession(): void {
  try {
    sessionStorage.setItem(ADMIN_SESSION_STORAGE_KEY, 'active_' + Date.now());
  } catch (e) {
    // fallback
  }
}

export function clearAdminSession(): void {
  try {
    sessionStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
  } catch (e) {
    // fallback
  }
}

export function hasActiveAdminSession(): boolean {
  try {
    const val = sessionStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
    return Boolean(val && val.startsWith('active_'));
  } catch (e) {
    return false;
  }
}
