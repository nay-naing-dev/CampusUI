/** Prices are in US dollars in the designs; 0 shows as "Free". */
export function formatPrice(dollars: number) {
  return dollars === 0 ? 'Free' : `$${dollars.toLocaleString('en-US')}`;
}

/** "now", "5m", "3h", "2d", then a short date. */
export function timeAgo(iso: string) {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/** Whole hours until `iso`, never below 0. */
export function hoursLeft(iso: string) {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 3_600_000));
}

/** "Mon 9:21 PM", for hold and response deadlines. */
export function deadline(iso: string) {
  const date = new Date(iso);
  const day = date.toLocaleDateString('en-US', { weekday: 'short' });
  return `${day} ${clockTime(iso)}`;
}

export function clockTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function firstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? name;
}

export function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
