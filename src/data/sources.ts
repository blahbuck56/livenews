export interface Source {
  id: string;
  name: string;
  url: string;
  category: 'wire' | 'liveblog' | 'regional' | 'independent' | 'video' | 'osint' | 'state' | 'analysis' | 'social';
  bias: 'neutral' | 'western' | 'regional' | 'state' | 'osint' | 'independent' | 'israeli' | 'opposition';
  type: 'website' | 'liveblog' | 'youtube' | 'twitter' | 'osint-tool' | 'think-tank' | 'reddit' | 'telegram';
  status: 'live' | 'active' | 'intermittent';
  country: string;
  description: string;
  youtubeEmbedId?: string;
  twitterHandle?: string;
}

export const allSources: Source[] = [
  // Wire Services
  { id: 'reuters', name: 'Reuters', url: 'https://www.reuters.com', category: 'wire', bias: 'neutral', type: 'website', status: 'live', country: 'UK', description: 'International wire service, gold standard for factual breaking news' },
  { id: 'ap', name: 'Associated Press', url: 'https://apnews.com', category: 'wire', bias: 'neutral', type: 'website', status: 'live', country: 'USA', description: 'Non-profit wire service, widely cited, minimal editorial bias' },
  { id: 'afp', name: 'AFP', url: 'https://www.afp.com', category: 'wire', bias: 'neutral', type: 'website', status: 'live', country: 'France', description: 'French wire service, strong Middle East bureau coverage' },

  // Live Blogs
  { id: 'aje-blog', name: 'Al Jazeera Live Blog', url: 'https://www.aljazeera.com', category: 'liveblog', bias: 'regional', type: 'liveblog', status: 'live', country: 'Qatar', description: 'Qatar-funded, extensive on-ground correspondents' },
  { id: 'bbc-blog', name: 'BBC Live Blog', url: 'https://www.bbc.com/news', category: 'liveblog', bias: 'neutral', type: 'liveblog', status: 'live', country: 'UK', description: 'British public broadcaster, generally balanced' },
  { id: 'cnn-blog', name: 'CNN Live Updates', url: 'https://www.cnn.com', category: 'liveblog', bias: 'western', type: 'liveblog', status: 'live', country: 'USA', description: 'US cable news, strong Pentagon and State Dept sources' },
  { id: 'nbc', name: 'NBC News', url: 'https://www.nbcnews.com', category: 'liveblog', bias: 'western', type: 'liveblog', status: 'active', country: 'USA', description: 'US broadcast network, strong investigative reporting' },
  { id: 'cbs', name: 'CBS News', url: 'https://www.cbsnews.com', category: 'liveblog', bias: 'western', type: 'liveblog', status: 'active', country: 'USA', description: 'US broadcast network news division' },
  { id: 'guardian', name: 'The Guardian', url: 'https://www.theguardian.com', category: 'liveblog', bias: 'western', type: 'liveblog', status: 'live', country: 'UK', description: 'British broadsheet, progressive editorial stance' },
  { id: 'newarab', name: 'The New Arab', url: 'https://www.newarab.com', category: 'liveblog', bias: 'regional', type: 'liveblog', status: 'active', country: 'UK/Qatar', description: 'Pan-Arab news outlet based in London' },
  { id: 'wapo', name: 'Washington Post', url: 'https://www.washingtonpost.com', category: 'liveblog', bias: 'western', type: 'liveblog', status: 'live', country: 'USA', description: 'US broadsheet, strong national security reporting' },
  { id: 'nyt', name: 'New York Times', url: 'https://www.nytimes.com', category: 'liveblog', bias: 'western', type: 'liveblog', status: 'live', country: 'USA', description: 'US paper of record, extensive foreign correspondent network' },
  { id: 'toi', name: 'Times of Israel', url: 'https://www.timesofisrael.com', category: 'liveblog', bias: 'israeli', type: 'liveblog', status: 'live', country: 'Israel', description: 'Israeli news site, centrist Israeli perspective' },

  // Regional
  { id: 'aje', name: 'Al Jazeera', url: 'https://www.aljazeera.com', category: 'regional', bias: 'regional', type: 'website', status: 'live', country: 'Qatar', description: 'Qatar state-funded, largest Arabic news network globally' },
  { id: 'mee', name: 'Middle East Eye', url: 'https://www.middleeasteye.net', category: 'regional', bias: 'independent', type: 'website', status: 'active', country: 'UK', description: 'London-based, regional perspective' },
  { id: 'arabnews', name: 'Arab News', url: 'https://www.arabnews.com', category: 'regional', bias: 'regional', type: 'website', status: 'active', country: 'Saudi Arabia', description: 'Saudi-owned English-language daily' },
  { id: 'haaretz', name: 'Haaretz', url: 'https://www.haaretz.com', category: 'regional', bias: 'israeli', type: 'website', status: 'active', country: 'Israel', description: 'Israeli broadsheet, left-leaning, critical of government' },
  { id: 'national', name: 'The National', url: 'https://www.thenationalnews.com', category: 'regional', bias: 'regional', type: 'website', status: 'active', country: 'UAE', description: 'Abu Dhabi state-owned English-language newspaper' },
  { id: 'trt', name: 'TRT World', url: 'https://www.trtworld.com', category: 'regional', bias: 'regional', type: 'website', status: 'active', country: 'Turkey', description: 'Turkish state broadcaster, English-language international service' },

  // Independent
  { id: 'iranintl', name: 'Iran International', url: 'https://www.iranintl.com', category: 'independent', bias: 'opposition', type: 'website', status: 'live', country: 'UK', description: 'London-based, critical of Iranian regime, Saudi-linked funding' },
  { id: 'iranwire', name: 'IranWire', url: 'https://iranwire.com', category: 'independent', bias: 'opposition', type: 'website', status: 'active', country: 'UK', description: 'Independent journalism platform covering Iran' },
  { id: '972mag', name: '+972 Magazine', url: 'https://www.972mag.com', category: 'independent', bias: 'independent', type: 'website', status: 'active', country: 'Israel/Palestine', description: 'Independent Israeli-Palestinian journalism' },
  { id: 'intercept', name: 'The Intercept', url: 'https://theintercept.com', category: 'independent', bias: 'independent', type: 'website', status: 'active', country: 'USA', description: 'Investigative journalism, strong national security reporting' },
  { id: 'mondoweiss', name: 'Mondoweiss', url: 'https://mondoweiss.net', category: 'independent', bias: 'independent', type: 'website', status: 'active', country: 'USA', description: 'Independent news on Palestine/Israel and US policy' },
  { id: 'cnbc', name: 'CNBC', url: 'https://www.cnbc.com', category: 'independent', bias: 'western', type: 'website', status: 'active', country: 'USA', description: 'Business news, covers market impact of geopolitics' },
  { id: 'fortune', name: 'Fortune', url: 'https://fortune.com', category: 'independent', bias: 'western', type: 'website', status: 'active', country: 'USA', description: 'Business magazine, economic and corporate perspective' },

  // YouTube Live
  { id: 'yt-aje', name: 'Al Jazeera English', url: 'https://www.youtube.com/c/AlJazeeraEnglish', category: 'video', bias: 'regional', type: 'youtube', status: 'live', country: 'Qatar', description: 'On-ground Tehran correspondent, extensive live coverage', youtubeEmbedId: 'gCNeDWCI0vo' },
  { id: 'yt-sky', name: 'Sky News', url: 'https://www.youtube.com/c/skynews', category: 'video', bias: 'western', type: 'youtube', status: 'live', country: 'UK', description: 'British, balanced breaking news coverage', youtubeEmbedId: '9Auq9mYxFEE' },
  { id: 'yt-f24', name: 'France 24 English', url: 'https://www.youtube.com/c/FRANCE24English', category: 'video', bias: 'neutral', type: 'youtube', status: 'live', country: 'France', description: 'French public broadcaster, European perspective', youtubeEmbedId: 'Ap-UM1O9RBk' },
  { id: 'yt-dw', name: 'DW News', url: 'https://www.youtube.com/c/DWNews', category: 'video', bias: 'neutral', type: 'youtube', status: 'live', country: 'Germany', description: 'German public broadcaster, analytical', youtubeEmbedId: 'GE_SfNVNyqk' },
  { id: 'yt-iranintl', name: 'Iran International TV', url: 'https://www.youtube.com/c/IranIntlTV', category: 'video', bias: 'opposition', type: 'youtube', status: 'live', country: 'UK', description: 'London-based diaspora channel, sources inside Iran', youtubeEmbedId: '5LBjODFbMVo' },
  { id: 'yt-bbc', name: 'BBC News', url: 'https://www.youtube.com/c/BBCNews', category: 'video', bias: 'neutral', type: 'youtube', status: 'live', country: 'UK', description: 'UK public broadcaster, global standard', youtubeEmbedId: 'drOQ9kGjFOk' },
  { id: 'yt-abc', name: 'ABC News', url: 'https://www.youtube.com/c/ABCNews', category: 'video', bias: 'western', type: 'youtube', status: 'live', country: 'USA', description: 'U.S. network, White House pool access', youtubeEmbedId: 'w_Ma8oQLmSM' },
  { id: 'yt-wion', name: 'WION', url: 'https://www.youtube.com/c/WIONews', category: 'video', bias: 'neutral', type: 'youtube', status: 'live', country: 'India', description: 'Indian perspective, non-aligned viewpoint', youtubeEmbedId: '_dL0CZWB4bE' },
  { id: 'yt-trt', name: 'TRT World', url: 'https://www.youtube.com/c/TRTWorld', category: 'video', bias: 'regional', type: 'youtube', status: 'active', country: 'Turkey', description: "Turkish state broadcaster, Ankara's perspective", youtubeEmbedId: 'CV5Fooi8YJA' },
  { id: 'yt-i24', name: 'i24NEWS', url: 'https://www.youtube.com/c/i24NEWS', category: 'video', bias: 'israeli', type: 'youtube', status: 'live', country: 'Israel', description: 'Israeli English-language, live from Tel Aviv', youtubeEmbedId: 'F-POY4Q0QSI' },
  { id: 'yt-presstv', name: 'Press TV', url: 'https://www.youtube.com/c/PressTVIran', category: 'video', bias: 'state', type: 'youtube', status: 'active', country: 'Iran', description: 'Iranian state English-language broadcaster', youtubeEmbedId: 'cHELsaO4bKo' },

  // OSINT
  { id: 'liveuamap', name: 'Liveuamap Iran', url: 'https://iran.liveuamap.com', category: 'osint', bias: 'osint', type: 'osint-tool', status: 'live', country: 'Ukraine', description: 'Crowdsourced conflict map with real-time incident tracking' },
  { id: 'iranmonitor', name: 'Iran Monitor', url: 'https://iranmonitor.org', category: 'osint', bias: 'osint', type: 'osint-tool', status: 'active', country: 'International', description: 'OSINT aggregation focused on Iran military activity' },
  { id: 'netblocks', name: 'NetBlocks', url: 'https://netblocks.org', category: 'osint', bias: 'osint', type: 'osint-tool', status: 'live', country: 'UK', description: 'Internet censorship and connectivity monitoring' },
  { id: 'firms', name: 'NASA FIRMS', url: 'https://firms.modaps.eosdis.nasa.gov', category: 'osint', bias: 'osint', type: 'osint-tool', status: 'live', country: 'USA', description: 'Satellite fire/hotspot detection, can indicate strikes' },
  { id: 'flightradar', name: 'Flightradar24', url: 'https://www.flightradar24.com', category: 'osint', bias: 'osint', type: 'osint-tool', status: 'live', country: 'Sweden', description: 'Flight tracking, monitoring airspace closures' },
  { id: 'marinetraffic', name: 'MarineTraffic', url: 'https://www.marinetraffic.com', category: 'osint', bias: 'osint', type: 'osint-tool', status: 'live', country: 'Greece', description: 'Ship tracking for Strait of Hormuz naval activity' },
  { id: 'acled', name: 'ACLED', url: 'https://acleddata.com', category: 'osint', bias: 'osint', type: 'osint-tool', status: 'active', country: 'USA', description: 'Armed conflict location and event data project' },
  { id: 'bellingcat', name: 'Bellingcat', url: 'https://www.bellingcat.com', category: 'osint', bias: 'osint', type: 'osint-tool', status: 'active', country: 'Netherlands', description: 'Investigative OSINT journalism collective' },

  // State Media
  { id: 'irna', name: 'IRNA', url: 'https://en.irna.ir', category: 'state', bias: 'state', type: 'website', status: 'active', country: 'Iran', description: 'Islamic Republic News Agency, official Iranian state wire' },
  { id: 'presstv', name: 'Press TV', url: 'https://www.presstv.ir', category: 'state', bias: 'state', type: 'website', status: 'active', country: 'Iran', description: 'Iranian state English-language 24hr news network' },
  { id: 'fars', name: 'Fars News', url: 'https://www.farsnews.ir/en', category: 'state', bias: 'state', type: 'website', status: 'active', country: 'Iran', description: 'Semi-official, linked to IRGC, hardline perspective' },
  { id: 'tasnim', name: 'Tasnim News', url: 'https://www.tasnimnews.com/en', category: 'state', bias: 'state', type: 'website', status: 'active', country: 'Iran', description: 'IRGC-affiliated, primary for military statements' },
  { id: 'idf', name: 'IDF Official', url: 'https://www.idf.il', category: 'state', bias: 'israeli', type: 'website', status: 'live', country: 'Israel', description: 'Israel Defense Forces official communications' },

  // Think Tanks
  { id: 'isw', name: 'ISW', url: 'https://www.understandingwar.org', category: 'analysis', bias: 'western', type: 'think-tank', status: 'active', country: 'USA', description: 'Institute for the Study of War, battlefield assessments' },
  { id: 'icg', name: 'Intl Crisis Group', url: 'https://www.crisisgroup.org', category: 'analysis', bias: 'neutral', type: 'think-tank', status: 'active', country: 'Belgium', description: 'Independent conflict prevention and resolution' },
  { id: 'cfr', name: 'Council on Foreign Relations', url: 'https://www.cfr.org', category: 'analysis', bias: 'western', type: 'think-tank', status: 'active', country: 'USA', description: 'US foreign policy think tank, establishment perspective' },
  { id: 'bellingcat-a', name: 'Bellingcat (Analysis)', url: 'https://www.bellingcat.com', category: 'analysis', bias: 'osint', type: 'think-tank', status: 'active', country: 'Netherlands', description: 'Open source investigation and verification' },
  { id: 'rusi', name: 'RUSI', url: 'https://www.rusi.org', category: 'analysis', bias: 'western', type: 'think-tank', status: 'active', country: 'UK', description: 'Royal United Services Institute, UK defense and security' },
  { id: 'quincy', name: 'Quincy Institute', url: 'https://quincyinst.org', category: 'analysis', bias: 'independent', type: 'think-tank', status: 'active', country: 'USA', description: 'Advocates diplomatic engagement and restraint' },
  { id: 'atlantic', name: 'Atlantic Council', url: 'https://www.atlanticcouncil.org', category: 'analysis', bias: 'western', type: 'think-tank', status: 'active', country: 'USA', description: 'Transatlantic policy think tank, strong Iran coverage' },

  // Twitter
  { id: 'tw-reuters', name: '@Reuters', url: 'https://twitter.com/Reuters', category: 'social', bias: 'neutral', type: 'twitter', status: 'live', country: 'UK', description: 'Reuters breaking news', twitterHandle: 'Reuters' },
  { id: 'tw-ap', name: '@AP', url: 'https://twitter.com/AP', category: 'social', bias: 'neutral', type: 'twitter', status: 'live', country: 'USA', description: 'Associated Press breaking news', twitterHandle: 'AP' },
  { id: 'tw-aje', name: '@AJEnglish', url: 'https://twitter.com/AJEnglish', category: 'social', bias: 'regional', type: 'twitter', status: 'live', country: 'Qatar', description: 'Al Jazeera English official', twitterHandle: 'AJEnglish' },
  { id: 'tw-bbc', name: '@BBCBreaking', url: 'https://twitter.com/BBCBreaking', category: 'social', bias: 'neutral', type: 'twitter', status: 'live', country: 'UK', description: 'BBC Breaking News', twitterHandle: 'BBCBreaking' },
  { id: 'tw-iranintl', name: '@IranIntl_En', url: 'https://twitter.com/IranIntl_En', category: 'social', bias: 'opposition', type: 'twitter', status: 'live', country: 'UK', description: 'Iran International English', twitterHandle: 'IranIntl_En' },
  { id: 'tw-sentdef', name: '@sentdefender', url: 'https://twitter.com/sentdefender', category: 'social', bias: 'osint', type: 'twitter', status: 'live', country: 'USA', description: 'OSINT Defender, real-time conflict updates', twitterHandle: 'sentdefender' },
  { id: 'tw-osintwar', name: '@OSINTWarfare', url: 'https://twitter.com/OSINTWarfare', category: 'social', bias: 'osint', type: 'twitter', status: 'active', country: 'International', description: 'OSINT warfare tracking', twitterHandle: 'OSINTWarfare' },
  { id: 'tw-osint613', name: '@Osint613', url: 'https://twitter.com/Osint613', category: 'social', bias: 'osint', type: 'twitter', status: 'active', country: 'Israel', description: 'Israel-focused OSINT tracker', twitterHandle: 'Osint613' },
  { id: 'tw-netblocks', name: '@netblocks', url: 'https://twitter.com/netblocks', category: 'social', bias: 'osint', type: 'twitter', status: 'live', country: 'UK', description: 'Internet connectivity monitor', twitterHandle: 'netblocks' },
  { id: 'tw-isw', name: '@TheStudyofWar', url: 'https://twitter.com/TheStudyofWar', category: 'social', bias: 'western', type: 'twitter', status: 'active', country: 'USA', description: 'ISW official', twitterHandle: 'TheStudyofWar' },
  { id: 'tw-karam', name: '@Joyce_Karam', url: 'https://twitter.com/Joyce_Karam', category: 'social', bias: 'independent', type: 'twitter', status: 'active', country: 'USA/Lebanon', description: 'Middle East policy journalist', twitterHandle: 'Joyce_Karam' },
  { id: 'tw-ravid', name: '@BarakRavid', url: 'https://twitter.com/BarakRavid', category: 'social', bias: 'israeli', type: 'twitter', status: 'active', country: 'Israel', description: 'Axios, Israeli diplomatic sources', twitterHandle: 'BarakRavid' },
  { id: 'tw-bertrand', name: '@NatashaBertrand', url: 'https://twitter.com/NatashaBertrand', category: 'social', bias: 'western', type: 'twitter', status: 'active', country: 'USA', description: 'CNN Pentagon/Intelligence reporter', twitterHandle: 'NatashaBertrand' },
  { id: 'tw-detsch', name: '@JackDetsch', url: 'https://twitter.com/JackDetsch', category: 'social', bias: 'western', type: 'twitter', status: 'active', country: 'USA', description: 'Foreign Policy Pentagon reporter', twitterHandle: 'JackDetsch' },
  { id: 'tw-vaez', name: '@Ali_Vaez', url: 'https://twitter.com/Ali_Vaez', category: 'social', bias: 'independent', type: 'twitter', status: 'active', country: 'USA/Iran', description: 'Crisis Group Iran director', twitterHandle: 'Ali_Vaez' },
  { id: 'tw-moaveni', name: '@AzadehMoaveni', url: 'https://twitter.com/AzadehMoaveni', category: 'social', bias: 'independent', type: 'twitter', status: 'active', country: 'UK/Iran', description: 'Author covering Iran', twitterHandle: 'AzadehMoaveni' },
  { id: 'tw-iranwire', name: '@IranWire', url: 'https://twitter.com/IranWire', category: 'social', bias: 'opposition', type: 'twitter', status: 'active', country: 'UK', description: 'IranWire independent journalism', twitterHandle: 'IranWire' },
  { id: 'tw-amanpour', name: '@camanpour', url: 'https://twitter.com/camanpour', category: 'social', bias: 'western', type: 'twitter', status: 'active', country: 'USA/UK', description: 'CNN chief international anchor', twitterHandle: 'camanpour' },

  // Reddit
  { id: 'r-iran', name: 'r/iran', url: 'https://www.reddit.com/r/iran', category: 'social', bias: 'independent', type: 'reddit', status: 'active', country: 'International', description: 'Iran subreddit, diaspora-heavy, opposition-leaning' },
  { id: 'r-worldnews', name: 'r/worldnews', url: 'https://www.reddit.com/r/worldnews', category: 'social', bias: 'neutral', type: 'reddit', status: 'live', country: 'International', description: 'Major subreddit for international news aggregation' },
  { id: 'r-geopolitics', name: 'r/geopolitics', url: 'https://www.reddit.com/r/geopolitics', category: 'social', bias: 'neutral', type: 'reddit', status: 'active', country: 'International', description: 'Academic-leaning geopolitical discussion' },
  { id: 'r-osint', name: 'r/OSINT', url: 'https://www.reddit.com/r/OSINT', category: 'social', bias: 'osint', type: 'reddit', status: 'active', country: 'International', description: 'Open source intelligence community' },
  { id: 'r-iranconflict', name: 'r/IranConflict', url: 'https://www.reddit.com/r/IranConflict', category: 'social', bias: 'independent', type: 'reddit', status: 'active', country: 'International', description: 'Dedicated subreddit for the Iran conflict' },
];
