import type { BeforeSend } from '@vercel/analytics/react';

/**
 * Keeps the site owner's own browsing out of Vercel Analytics. Once a super user signs in on a device, that device is
 * remembered and none of its page views are sent, even after signing out, so admin checks don't inflate the stats.
 */
const KEY = 'cri-exclude-analytics';

export function excludeThisDevice() {
  try {
    window.localStorage.setItem(KEY, '1');
  } catch {
    // Storage unavailable (private mode): views are only skipped while signed in this session.
  }
}

let excludedThisSession = false;

/** Called once a super user is known, so views are skipped even if storage is unavailable. */
export function markSuperUserSession() {
  excludedThisSession = true;
  excludeThisDevice();
}

function isExcluded(): boolean {
  if (excludedThisSession) return true;
  try {
    return window.localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

/** Passed to <Analytics beforeSend>: drops every event from an excluded device. */
export const analyticsBeforeSend: BeforeSend = (event) => (isExcluded() ? null : event);
