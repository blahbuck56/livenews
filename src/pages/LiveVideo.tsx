import { allSources } from '../data/sources';
import BiasTag from '../components/common/BiasTag';
import SectionHeader from '../components/common/SectionHeader';

export default function LiveVideo() {
  const videoSources = allSources.filter((s) => s.type === 'youtube' && s.youtubeEmbedId);
  const featured = videoSources[0]; // Al Jazeera
  const grid = videoSources.slice(1);

  return (
    <div className="max-w-[1800px] mx-auto px-3 sm:px-4 py-3 sm:py-4">
      <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', letterSpacing: '-0.5px', marginBottom: '16px' }}>Live Video</h1>

      {/* Featured */}
      {featured && (
        <div className="card overflow-hidden mb-4">
          <div className="relative aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${featured.youtubeEmbedId}?autoplay=0&mute=1`}
              title={featured.name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
              style={{ border: 0 }}
            />
            {featured.status === 'live' && (
              <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-[#DC2626] rounded-[3px]">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-dot" />
                <span className="font-mono text-white" style={{ fontSize: '9px', fontWeight: 700 }}>LIVE</span>
              </div>
            )}
          </div>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>{featured.name}</span>
              <BiasTag bias={featured.bias} />
            </div>
            <p className="text-[13px] text-[#6B7280]">{featured.description}</p>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-6">
        {grid.map((s) => (
          <div key={s.id} className="card overflow-hidden hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-shadow">
            <div className="relative aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${s.youtubeEmbedId}?autoplay=0&mute=1`}
                title={s.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
                style={{ border: 0 }}
              />
              {s.status === 'live' && (
                <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 bg-[#DC2626] rounded-[2px]">
                  <span className="w-1 h-1 rounded-full bg-white animate-pulse-dot" />
                  <span className="font-mono text-white" style={{ fontSize: '8px', fontWeight: 700 }}>LIVE</span>
                </div>
              )}
            </div>
            <div className="p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[12px] font-semibold text-[#111827]">{s.name}</span>
                <BiasTag bias={s.bias} />
              </div>
              <p className="text-[11px] text-[#6B7280] line-clamp-2">{s.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Related Videos */}
      <div className="card p-4">
        <SectionHeader>Related Video Content</SectionHeader>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[
            { title: 'Iran Strikes Analysis', channel: 'CNN' },
            { title: 'Tehran After the Bombs', channel: 'Al Jazeera' },
            { title: 'Operation Epic Fury Explained', channel: 'BBC' },
            { title: 'Nuclear Sites Assessment', channel: 'DW News' },
            { title: 'Strait of Hormuz Impact', channel: 'Sky News' },
            { title: 'IRGC Retaliation Footage', channel: 'Iran International' },
            { title: 'Gulf Airspace Closures', channel: 'France 24' },
            { title: 'Pentagon Briefing', channel: 'ABC News' },
          ].map((v, i) => (
            <div key={i} className="shrink-0 w-40 sm:w-52 card overflow-hidden hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-shadow cursor-pointer">
              <div className="h-28 bg-gray-100 flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="#9CA3AF"><path d="M8 5v14l11-7z" /></svg>
              </div>
              <div className="p-2">
                <div className="text-[11px] font-medium text-[#111827] line-clamp-2">{v.title}</div>
                <div className="text-[10px] text-[#9CA3AF] mt-0.5">{v.channel}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
