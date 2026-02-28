import { videoStreams } from '../data/videoStreams';
import BiasTag from '../components/BiasTag';

export default function LiveVideo() {
  const primary = videoStreams.filter((v) => v.primary);
  const secondary = videoStreams.filter((v) => !v.primary);

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <h1 className="text-lg font-bold text-[#111827] mb-4">Live Video</h1>

      {/* Primary Streams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
        {primary.map((stream) => (
          <div key={stream.id} className="bg-white border border-[#E5E7EB] rounded-[6px] overflow-hidden">
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${stream.youtubeId}?autoplay=0&mute=1`}
                title={stream.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
                style={{ border: 0 }}
              />
            </div>
            <div className="p-3">
              <div className="flex items-center gap-2 mb-1">
                {stream.isLive && (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 bg-[#FEE2E2] text-[#DC2626] text-[10px] font-bold rounded" style={{ borderRadius: '3px' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] animate-pulse-dot" />
                    LIVE
                  </span>
                )}
                <BiasTag bias={stream.biasTag} />
              </div>
              <h3 className="text-sm font-semibold text-[#111827]">{stream.title}</h3>
              <p className="text-[11px] text-[#6B7280] mt-0.5">{stream.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Secondary Streams */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {secondary.map((stream) => (
          <div key={stream.id} className="bg-white border border-[#E5E7EB] rounded-[6px] overflow-hidden">
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${stream.youtubeId}?autoplay=0&mute=1`}
                title={stream.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
                style={{ border: 0 }}
              />
            </div>
            <div className="p-2.5">
              <div className="flex items-center gap-1.5 mb-1">
                {stream.isLive && (
                  <span className="flex items-center gap-1 px-1 py-0.5 bg-[#FEE2E2] text-[#DC2626] text-[9px] font-bold rounded" style={{ borderRadius: '2px' }}>
                    <span className="w-1 h-1 rounded-full bg-[#DC2626] animate-pulse-dot" />
                    LIVE
                  </span>
                )}
                <BiasTag bias={stream.biasTag} />
              </div>
              <h4 className="text-xs font-semibold text-[#111827]">{stream.channel}</h4>
              <p className="text-[10px] text-[#6B7280] mt-0.5 line-clamp-2">{stream.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Related Video Content */}
      <div className="bg-white border border-[#E5E7EB] rounded-[6px] p-4">
        <h3 className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-3">Related Video Content</h3>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[
            { id: 'dQw4w9WgXcQ', title: 'Iran Strikes Analysis', channel: 'CNN' },
            { id: 'dQw4w9WgXcQ', title: 'Tehran After the Bombs', channel: 'Al Jazeera' },
            { id: 'dQw4w9WgXcQ', title: 'Operation Epic Fury Explained', channel: 'BBC' },
            { id: 'dQw4w9WgXcQ', title: 'Nuclear Sites Assessment', channel: 'DW News' },
            { id: 'dQw4w9WgXcQ', title: 'Strait of Hormuz Impact', channel: 'Sky News' },
          ].map((video, i) => (
            <div key={i} className="shrink-0 w-56 border border-[#E5E7EB] rounded-[6px] overflow-hidden">
              <img
                src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                alt={video.title}
                className="w-full h-32 object-cover"
              />
              <div className="p-2">
                <div className="text-xs font-medium text-[#111827] line-clamp-2">{video.title}</div>
                <div className="text-[10px] text-[#6B7280] mt-0.5">{video.channel}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
