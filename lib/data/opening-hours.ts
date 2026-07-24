export type OpeningHoursRow = {
  day: string;
  hours: string;
};

export const OPENING_HOURS: readonly OpeningHoursRow[] = [
  { day: "Mandag", hours: "09:00–17:00" },
  { day: "Tirsdag", hours: "09:00–17:00" },
  { day: "Onsdag", hours: "09:00–17:00" },
  { day: "Torsdag", hours: "09:00–19:00" },
  { day: "Fredag", hours: "09:00–17:00" },
  { day: "Lørdag", hours: "10:00–15:00" },
  { day: "Søndag", hours: "Stengt" },
] as const;

/** Seasonal summer hours (same calendar year; inclusive). */
export const SUMMER_OPENING_HOURS_PERIOD = "29.06–02.08" as const;

export const SUMMER_OPENING_HOURS: readonly OpeningHoursRow[] = [
  { day: "Mandag–fredag", hours: "10:00–16:00" },
  { day: "Lørdag", hours: "Stengt" },
] as const;
