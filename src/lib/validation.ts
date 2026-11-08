export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/** Students sign up with a personal Gmail; their campus is chosen separately. */
export function isGmail(email: string) {
  return /^[a-z0-9.+_-]+@gmail\.com$/i.test(email.trim());
}

export const MIN_PASSWORD_LENGTH = 8;

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Strong', 'Very strong'];

/** Scores a password from 0 (empty) to 4; anything under the minimum length is Weak. */
export function passwordStrength(password: string) {
  if (!password) return { score: 0, label: '' };
  if (password.length < MIN_PASSWORD_LENGTH) return { score: 1, label: STRENGTH_LABELS[1] };
  const score =
    1 +
    (/[a-z]/.test(password) && /[A-Z]/.test(password) ? 1 : 0) +
    (/\d/.test(password) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(password) ? 1 : 0);
  return { score, label: STRENGTH_LABELS[score] };
}
