export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function formatUTC(): string {
  const now = new Date();
  return now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
}

export function formatTehran(): string {
  const now = new Date();
  const tehranOffset = 3.5 * 60;
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const tehranMs = utcMs + tehranOffset * 60000;
  const tehran = new Date(tehranMs);
  const h = String(tehran.getHours()).padStart(2, '0');
  const m = String(tehran.getMinutes()).padStart(2, '0');
  const s = String(tehran.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s} IRST`;
}

export function isBreaking(dateStr: string): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  return (now.getTime() - date.getTime()) < 10 * 60 * 1000;
}

export function isDeveloping(dateStr: string): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return diff >= 10 * 60 * 1000 && diff < 60 * 60 * 1000;
}
