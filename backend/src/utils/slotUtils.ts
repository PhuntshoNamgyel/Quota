// src/utils/slotUtils.ts
function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export function slotClasses(start: string, end: string): number {
  let minutes = timeToMinutes(end) - timeToMinutes(start);
  const slotStart = timeToMinutes(start);
  const slotEnd = timeToMinutes(end);

  // Tea break: 10:00–10:15 (15 min) — deduct only if slot fully spans it
  if (slotStart < timeToMinutes('10:00') && slotEnd > timeToMinutes('10:15')) minutes -= 15;

  // Lunch break: 12:15–13:15 (60 min) — deduct only if slot fully spans it
  if (slotStart < timeToMinutes('12:15') && slotEnd > timeToMinutes('13:15')) minutes -= 60;

  return Math.max(1, Math.round(minutes / 60));
}