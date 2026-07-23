export function normalizeName(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function normalizePhone(value: string): string {
  return value.replace(/\D/g, '');
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function weekBounds(reference = new Date(), timezoneNote = 'America/New_York'): {
  weekStart: Date;
  weekEnd: Date;
  dueAt: Date;
} {
  void timezoneNote;
  const d = new Date(reference);
  const day = d.getDay(); // 0 Sun
  const diffToMonday = (day + 6) % 7;
  const weekStart = new Date(d);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(d.getDate() - diffToMonday);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  // Friday due (default)
  const dueAt = new Date(weekStart);
  dueAt.setDate(weekStart.getDate() + 4);
  dueAt.setHours(23, 59, 59, 999);

  return { weekStart, weekEnd, dueAt };
}

export function isReportLate(submittedAt: Date, dueAt: Date): boolean {
  return submittedAt.getTime() > dueAt.getTime();
}
