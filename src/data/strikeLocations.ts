export interface StrikeLocation {
  name: string;
  lat: number;
  lng: number;
  description: string;
}

// Generate dynamic descriptions with relative timestamps
function strikeDateLabel(): string {
  const d = new Date(Date.now() - 4 * 86400000); // 4 days ago
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

export function getStrikeLocations(): StrikeLocation[] {
  const dateLabel = strikeDateLabel();
  return [
    { name: 'Tehran', lat: 35.6892, lng: 51.3890, description: `Strikes reported ${dateLabel}` },
    { name: 'Isfahan', lat: 32.6546, lng: 51.6680, description: `Strikes reported ${dateLabel}` },
    { name: 'Qom', lat: 34.6399, lng: 50.8759, description: `Strikes reported ${dateLabel}` },
    { name: 'Tabriz', lat: 38.0800, lng: 46.2919, description: `Strikes reported ${dateLabel}` },
    { name: 'Karaj', lat: 35.8400, lng: 50.9391, description: `Strikes reported ${dateLabel}` },
    { name: 'Kermanshah', lat: 34.3142, lng: 47.0650, description: `Strikes reported ${dateLabel}` },
    { name: 'Yazd', lat: 31.8974, lng: 54.3569, description: `Strikes reported ${dateLabel}` },
  ];
}

// Export a live instance for backwards compatibility
export const strikeLocations: StrikeLocation[] = getStrikeLocations();
