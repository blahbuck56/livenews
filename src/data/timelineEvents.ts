export interface TimelineEvent {
  date: string;
  title: string;
  description?: string;
}

export const timelineEvents: TimelineEvent[] = [
  { date: 'Jan 8', title: 'Mass protests erupt across Iran', description: 'Widespread anti-government demonstrations in major cities' },
  { date: 'Jan 13', title: 'Iran warns "ready for war"', description: 'IRGC commander issues stark warning to US and regional allies' },
  { date: 'Jan 28', title: 'Trump: "Massive Armada heading to Iran"', description: 'US naval carrier group deployed to Persian Gulf' },
  { date: 'Jan 29', title: 'EU labels IRGC terrorist organization', description: 'European Union designates IRGC as terrorist group' },
  { date: 'Feb 19', title: 'Reports: U.S. could strike within days', description: 'Pentagon sources confirm operational planning' },
  { date: 'Feb 26', title: 'Third round of talks in Geneva', description: 'Final diplomatic effort fails to prevent escalation' },
  { date: 'Feb 27', title: 'USS Gerald Ford arrives off Israel coast', description: 'Carrier strike group positioned in Eastern Mediterranean' },
  { date: 'Feb 28', title: 'U.S. & Israel launch strikes — "Operation Epic Fury"', description: 'Coordinated airstrikes on nuclear and military targets' },
  { date: 'Feb 28', title: 'IRGC retaliates — missiles toward Israel', description: 'Ballistic missile launches from Iranian territory' },
  { date: 'Feb 28', title: 'Gulf states close airspace', description: 'Qatar, Kuwait, Bahrain, UAE suspend commercial flights' },
];
