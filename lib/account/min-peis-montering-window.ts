/**
 * Whether the peis is still inside the post-purchase montering help window.
 *
 * Assumption: `ownedSinceDate` is an ISO-8601 string (UTC from `Date.toISOString()`).
 * Elapsed time is measured in absolute milliseconds (`Date.now() - ownedMs`),
 * so the window is timezone-independent (not calendar-day based).
 */
export const MIN_PEIS_MONTERING_HELP_DAYS = 30;

export function isWithinMonteringHelpWindow(
  ownedSinceDate: string,
  nowMs: number = Date.now(),
  days: number = MIN_PEIS_MONTERING_HELP_DAYS
): boolean {
  const ownedMs = Date.parse(ownedSinceDate);
  if (Number.isNaN(ownedMs)) return false;
  const elapsedMs = nowMs - ownedMs;
  if (elapsedMs < 0) return true;
  return elapsedMs <= days * 24 * 60 * 60 * 1000;
}
