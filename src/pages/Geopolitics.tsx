import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { useGeopoliticsNews } from '../hooks/useGdeltArticles';
import { timeAgo } from '../hooks/useConflictData';
import { timelineEvents } from '../data/timelineEvents';
import { FeedSkeleton } from '../components/common/LoadingSkeleton';
import ErrorState from '../components/common/ErrorState';
import SectionHeader from '../components/common/SectionHeader';

const CARTO_TILES = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

const topicConfig = [
  { key: 'oil', title: 'Oil & Energy', color: '#D97706' },
  { key: 'gulf', title: 'Gulf States', color: '#0D9488' },
  { key: 'europe', title: 'Europe & NATO', color: '#2563EB' },
  { key: 'russiachina', title: 'Russia & China', color: '#DC2626' },
  { key: 'uspolitics', title: 'U.S. Politics', color: '#7C3AED' },
  { key: 'humanitarian', title: 'Humanitarian', color: '#16A34A' },
];

const conflictZones = [
  { name: 'Iran', lat: 32.4, lng: 53.7, intensity: 10, color: '#DC2626', connection: 'Primary conflict zone — active strikes' },
  { name: 'Ukraine', lat: 48.4, lng: 31.2, intensity: 8, color: '#D97706', connection: 'Russia diverting attention; US resources stretched' },
  { name: 'Sudan', lat: 12.8, lng: 30.2, intensity: 7, color: '#D97706', connection: 'Iran-aligned forces in Red Sea corridor' },
  { name: 'Myanmar', lat: 19.8, lng: 96.1, intensity: 5, color: '#D97706', connection: 'Chinese influence zone; regional instability' },
  { name: 'Gaza/Israel', lat: 31.5, lng: 34.5, intensity: 9, color: '#DC2626', connection: 'Direct escalation; IDF two-front operations' },
  { name: 'Yemen', lat: 15.4, lng: 44.2, intensity: 7, color: '#D97706', connection: 'Houthi proxy attacks on shipping, Iranian supply lines' },
  { name: 'Syria', lat: 35.0, lng: 38.0, intensity: 5, color: '#D97706', connection: 'Iranian proxy Hezbollah staging ground' },
  { name: 'Lebanon', lat: 33.9, lng: 35.5, intensity: 6, color: '#D97706', connection: 'Hezbollah launch zone for northern Israel attacks' },
  { name: 'Somalia', lat: 5.2, lng: 46.2, intensity: 4, color: '#D97706', connection: 'Al-Shabaab disruption; shipping lane risks' },
  { name: 'Ethiopia', lat: 9.0, lng: 38.7, intensity: 4, color: '#D97706', connection: 'Horn of Africa instability; refugee flows' },
];

export default function Geopolitics() {
  const { data, isLoading, isError, refetch } = useGeopoliticsNews();

  return (
    <div className="max-w-[1800px] mx-auto px-3 sm:px-4 py-3 sm:py-4">
      <h1 className="text-[16px] sm:text-[18px] font-extrabold text-[#111827] tracking-[-0.5px] mb-4">Global Impact</h1>

      {/* Impact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        {isLoading ? Array.from({ length: 6 }).map((_, i) => <FeedSkeleton key={i} count={1} />) :
         isError ? <div className="col-span-full"><ErrorState message="Failed to load geopolitics data" onRetry={refetch} /></div> :
         topicConfig.map((topic) => (
          <div key={topic.key} className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: topic.color }} />
              <SectionHeader>{topic.title}</SectionHeader>
            </div>
            <div className="space-y-2.5">
              {(data?.[topic.key] || []).length > 0 ? (data?.[topic.key] || []).map((a: { id: string; title: string; url: string; source: string; publishedAt: string }) => (
                <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer" className="block no-underline hover:bg-gray-50 rounded-[3px] p-1 -mx-1 transition-colors">
                  <div className="text-[12px] font-medium text-[#111827] leading-snug hover:text-[#2563EB]">{a.title}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-[#6B7280]">{a.source}</span>
                    <span className="font-mono text-[10px] text-[#9CA3AF]">{timeAgo(a.publishedAt)}</span>
                  </div>
                </a>
              )) : <p className="text-[11px] text-[#9CA3AF] italic">No recent articles</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Conflict Timeline */}
      <div className="card p-4 mb-4">
        <SectionHeader>Conflict Timeline</SectionHeader>
        <div className="relative mt-4">
          <div className="absolute top-3 left-0 right-0 h-[2px] bg-[#E5E7EB]" />
          <div className="flex overflow-x-auto gap-0 pb-4">
            {timelineEvents.map((ev, i) => (
              <div key={i} className="flex flex-col items-center min-w-[120px] sm:min-w-[140px] px-1 sm:px-1.5 relative group cursor-default">
                <div className={`w-3 h-3 rounded-full border-2 z-10 transition-transform group-hover:scale-150 ${
                  ev.title.includes('Epic Fury') || ev.title.includes('retaliates') || ev.title.includes('close airspace')
                    ? 'bg-[#DC2626] border-[#DC2626]'
                    : 'bg-white border-[#6B7280] group-hover:border-[#111827]'
                }`} />
                <div className="mt-2 text-center">
                  <div className="font-mono text-[10px] font-medium text-[#6B7280]">{ev.date}</div>
                  <div className="text-[11px] font-semibold text-[#111827] mt-0.5 leading-tight">{ev.title}</div>
                  {ev.description && <div className="text-[10px] text-[#9CA3AF] mt-0.5 hidden group-hover:block">{ev.description}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* World Conflict Map */}
      <div className="card p-4">
        <SectionHeader>World Conflict Context</SectionHeader>
        <div className="h-[280px] sm:h-[400px] mt-2">
          <MapContainer center={[25, 45]} zoom={2} scrollWheelZoom={false} dragging={true} style={{ height: '100%', width: '100%', borderRadius: '6px' }}>
            <TileLayer attribution='&copy; CARTO' url={CARTO_TILES} />
            {conflictZones.map((zone) => (
              <CircleMarker
                key={zone.name}
                center={[zone.lat, zone.lng]}
                radius={zone.intensity * 2.5}
                fillColor={zone.color}
                fillOpacity={zone.name === 'Iran' ? 0.7 : 0.4}
                color={zone.color}
                weight={zone.name === 'Iran' ? 2 : 1}
              >
                <Popup>
                  <strong>{zone.name}</strong> — Intensity: {zone.intensity}/10<br />
                  <span style={{ fontSize: 11 }}>{zone.connection}</span>
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
    </div>
  );
}
