// src/format.ts
// Display dates as DD/MM/YYYY (storage stays ISO for correct sorting).
export function formatDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return y && m && d ? `${d}/${m}/${y}` : iso;
}
export function formatDateTime(iso: string): string {
  const date = formatDate(iso);
  const time = iso.length > 10 ? iso.slice(11, 16) : ''; // HH:MM
  return time ? `${date} ${time}` : date;
}