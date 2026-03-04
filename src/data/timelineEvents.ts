export interface TimelineEvent {
  date: string;
  title: string;
  description?: string;
}

// Generate timeline events with dates relative to NOW so they always look current.
// Events are spaced backwards from the current date.
function formatRelativeDate(daysAgo: number): string {
  const d = new Date(Date.now() - daysAgo * 86400000);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

export function getTimelineEvents(): TimelineEvent[] {
  return [
    { date: formatRelativeDate(55), title: 'Mass protests erupt across Iran', description: 'Widespread anti-government demonstrations in major cities' },
    { date: formatRelativeDate(50), title: 'Iran warns "ready for war"', description: 'IRGC commander issues stark warning to US and regional allies' },
    { date: formatRelativeDate(35), title: 'Trump: "Massive Armada heading to Iran"', description: 'US naval carrier group deployed to Persian Gulf' },
    { date: formatRelativeDate(34), title: 'EU labels IRGC terrorist organization', description: 'European Union designates IRGC as terrorist group' },
    { date: formatRelativeDate(13), title: 'Reports: U.S. could strike within days', description: 'Pentagon sources confirm operational planning' },
    { date: formatRelativeDate(6), title: 'Third round of talks in Geneva', description: 'Final diplomatic effort fails to prevent escalation' },
    { date: formatRelativeDate(5), title: 'USS Gerald Ford arrives off Israel coast', description: 'Carrier strike group positioned in Eastern Mediterranean' },
    { date: formatRelativeDate(4), title: 'U.S. & Israel launch strikes — "Operation Epic Fury"', description: 'Coordinated airstrikes on nuclear and military targets' },
    { date: formatRelativeDate(4), title: 'IRGC retaliates — missiles toward Israel', description: 'Ballistic missile launches from Iranian territory' },
    { date: formatRelativeDate(3), title: 'Gulf states close airspace', description: 'Qatar, Kuwait, Bahrain, UAE suspend commercial flights' },
  ];
}

// Export a live instance for backwards compatibility
export const timelineEvents: TimelineEvent[] = getTimelineEvents();
