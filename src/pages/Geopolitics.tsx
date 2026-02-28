import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { useGeopoliticsNews } from '../hooks/useGeopoliticsNews';
import { timelineEvents } from '../data/timeline';
import { timeAgo } from '../utils/time';
import { FeedSkeleton } from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import type { NewsArticle } from '../types';

const topicConfig = [
  { key: 'oil' as const, title: 'Oil & Energy Markets', icon: '#D97706' },
  { key: 'gulf' as const, title: 'Gulf States Response', icon: '#0D9488' },
  { key: 'europe' as const, title: 'European Reaction', icon: '#2563EB' },
  { key: 'russiachina' as const, title: 'Russia & China', icon: '#DC2626' },
  { key: 'uspolitics' as const, title: 'U.S. Domestic Politics', icon: '#7C3AED' },
  { key: 'humanitarian' as const, title: 'Humanitarian Impact', icon: '#16A34A' },
];

const conflictZones = [
  { name: 'Iran', lat: 32.4, lng: 53.7, intensity: 10, color: '#DC2626' },
  { name: 'Ukraine', lat: 48.4, lng: 31.2, intensity: 8, color: '#D97706' },
  { name: 'Sudan', lat: 12.8, lng: 30.2, intensity: 7, color: '#D97706' },
  { name: 'Myanmar', lat: 19.8, lng: 96.1, intensity: 6, color: '#D97706' },
  { name: 'Gaza', lat: 31.5, lng: 34.5, intensity: 9, color: '#DC2626' },
  { name: 'Yemen', lat: 15.4, lng: 44.2, intensity: 7, color: '#D97706' },
  { name: 'Syria', lat: 35.0, lng: 38.0, intensity: 5, color: '#D97706' },
  { name: 'Lebanon', lat: 33.9, lng: 35.5, intensity: 6, color: '#D97706' },
  { name: 'Iraq', lat: 33.2, lng: 43.7, intensity: 5, color: '#D97706' },
];

function ArticleList({ articles, color }: { articles: NewsArticle[]; color: string }) {
  if (articles.length === 0) {
    return <p className="text-xs text-[#9CA3AF] italic">No recent articles found</p>;
  }

  return (
    <div className="space-y-2">
      {articles.slice(0, 5).map((a) => (
        <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer" className="block no-underline">
          <div className="text-xs font-medium text-[#111827] hover:text-[#2563EB] leading-snug">{a.title}</div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-[#6B7280]">{a.source}</span>
            <span className="text-[10px] font-mono text-[#9CA3AF]">{timeAgo(a.publishedAt)}</span>
          </div>
        </a>
      ))}
    </div>
  );
}

export default function Geopolitics() {
  const { data, isLoading, isError, refetch } = useGeopoliticsNews();

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <h1 className="text-lg font-bold text-[#111827] mb-4">Global Impact</h1>

      {/* Section 1: Ripple Effects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <FeedSkeleton key={i} count={1} />)
        ) : isError ? (
          <div className="col-span-full"><ErrorState message="Failed to fetch geopolitics data" onRetry={refetch} /></div>
        ) : (
          topicConfig.map((topic) => (
            <div key={topic.key} className="bg-white border border-[#E5E7EB] rounded-[6px] p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: topic.icon }} />
                <h3 className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">{topic.title}</h3>
              </div>
              <ArticleList articles={data?.[topic.key] || []} color={topic.icon} />
            </div>
          ))
        )}
      </div>

      {/* Section 2: World Conflict Map */}
      <div className="bg-white border border-[#E5E7EB] rounded-[6px] p-4 mb-6">
        <h3 className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-3">Global Conflict Context</h3>
        <div className="h-[350px]">
          <MapContainer center={[30, 45]} zoom={3} scrollWheelZoom={false} style={{ height: '100%', width: '100%', borderRadius: '6px' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {conflictZones.map((zone) => (
              <CircleMarker
                key={zone.name}
                center={[zone.lat, zone.lng]}
                radius={zone.intensity * 3}
                fillColor={zone.color}
                fillOpacity={0.5}
                color={zone.color}
                weight={1}
              >
                <Popup>
                  <strong>{zone.name}</strong><br />
                  Conflict Intensity: {zone.intensity}/10
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
        <div className="flex flex-wrap gap-3 mt-3">
          {conflictZones.map((z) => (
            <span key={z.name} className="flex items-center gap-1 text-[10px] text-[#6B7280]">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: z.color }} />
              {z.name}
            </span>
          ))}
        </div>
      </div>

      {/* Section 3: Timeline */}
      <div className="bg-white border border-[#E5E7EB] rounded-[6px] p-4">
        <h3 className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-4">Key Events Timeline</h3>
        <div className="relative">
          {/* Horizontal line */}
          <div className="absolute top-4 left-0 right-0 h-[2px] bg-[#E5E7EB]" />

          <div className="flex overflow-x-auto gap-0 pb-4">
            {timelineEvents.map((event, i) => (
              <div key={i} className="flex flex-col items-center min-w-[160px] px-2 relative">
                {/* Dot on the line */}
                <div className={`w-3 h-3 rounded-full border-2 z-10 ${
                  event.date === 'Ongoing'
                    ? 'bg-[#DC2626] border-[#DC2626] animate-pulse-dot'
                    : event.date.includes('Feb 28')
                      ? 'bg-[#DC2626] border-[#DC2626]'
                      : 'bg-white border-[#6B7280]'
                }`} />
                <div className="mt-3 text-center">
                  <div className="text-[10px] font-mono font-semibold text-[#6B7280]">{event.date}</div>
                  <div className="text-[11px] font-semibold text-[#111827] mt-1 leading-tight">{event.title}</div>
                  {event.description && (
                    <div className="text-[10px] text-[#9CA3AF] mt-0.5 leading-snug">{event.description}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
