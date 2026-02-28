export interface StrikeLocation {
  name: string;
  lat: number;
  lng: number;
  description: string;
}

export const strikeLocations: StrikeLocation[] = [
  { name: 'Tehran', lat: 35.6892, lng: 51.3890, description: 'Strikes reported Feb 28' },
  { name: 'Isfahan', lat: 32.6546, lng: 51.6680, description: 'Strikes reported Feb 28' },
  { name: 'Qom', lat: 34.6399, lng: 50.8759, description: 'Strikes reported Feb 28' },
  { name: 'Tabriz', lat: 38.0800, lng: 46.2919, description: 'Strikes reported Feb 28' },
  { name: 'Karaj', lat: 35.8400, lng: 50.9391, description: 'Strikes reported Feb 28' },
  { name: 'Kermanshah', lat: 34.3142, lng: 47.0650, description: 'Strikes reported Feb 28' },
  { name: 'Yazd', lat: 31.8974, lng: 54.3569, description: 'Strikes reported Feb 28' },
];
