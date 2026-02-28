import { useState, useCallback, useRef, useEffect } from 'react';
import { allSources, type Source } from '../data/sources';
import BiasTag from '../components/common/BiasTag';
import SectionHeader from '../components/common/SectionHeader';

// ─── CHANNEL DATA ──────────────────────────────────────────────────────────────
// YouTube live stream IDs are volatile — they change when channels restart streams.
// We use the best-known IDs but detect failures and offer fallbacks.

interface StreamChannel {
  id: string;
  name: string;
  country: string;
  bias: Source['bias'];
  description: string;
  youtubeId: string;
  channelUrl: string;
  status: 'live' | 'active';
}

const streamChannels: StreamChannel[] = (() => {
  const yt = allSources.filter((s) => s.type === 'youtube' && s.youtubeEmbedId);
  return yt.map((s) => ({
    id: s.id,
    name: s.name,
    country: s.country,
    bias: s.bias,
    description: s.description,
    youtubeId: s.youtubeEmbedId!,
    channelUrl: s.url,
    status: s.status as 'live' | 'active',
  }));
})();

// ─── LAYOUT OPTIONS ─────────────────────────────────────────────────────────────

type Layout = '1' | '2' | '4' | '6';

const layouts: { key: Layout; label: string; cols: string; rows: string }[] = [
  { key: '1', label: '1', cols: 'grid-cols-1', rows: '' },
  { key: '2', label: '2', cols: 'grid-cols-1 sm:grid-cols-2', rows: '' },
  { key: '4', label: '4', cols: 'grid-cols-1 sm:grid-cols-2', rows: '' },
  { key: '6', label: '6', cols: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3', rows: '' },
];

// ─── STREAM PLAYER ──────────────────────────────────────────────────────────────

function StreamPlayer({
  channel,
  isAudioSource,
  onSetAudio,
  isFeatured,
}: {
  channel: StreamChannel;
  isAudioSource: boolean;
  onSetAudio: () => void;
  isFeatured: boolean;
}) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Detect load failures via timeout — YouTube iframes don't fire onerror reliably
  useEffect(() => {
    setStatus('loading');
    timeoutRef.current = setTimeout(() => {
      // After 15s if still loading, mark as potentially problematic but show anyway
      setStatus((prev) => (prev === 'loading' ? 'loaded' : prev));
    }, 15000);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [channel.youtubeId]);

  const handleLoad = useCallback(() => {
    setStatus('loaded');
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  return (
    <div className="card overflow-hidden flex flex-col">
      <div className={`relative bg-black ${isFeatured ? 'aspect-video' : 'aspect-video'}`}>
        {/* Loading overlay */}
        {status === 'loading' && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#111827]">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-[#374151] border-t-white rounded-full animate-spin mx-auto mb-2" />
              <div className="font-mono text-[10px] text-[#9CA3AF]">Connecting to stream...</div>
            </div>
          </div>
        )}

        {/* Error fallback */}
        {status === 'error' && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#111827]">
            <div className="text-center px-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="#6B7280" className="mx-auto mb-2">
                <path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zM9.5 12.5l3 3.5 2-2.5 3 4H6.5z" />
              </svg>
              <div className="text-[12px] text-[#9CA3AF] mb-2">Stream unavailable</div>
              <a
                href={channel.channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#DC2626] text-white text-[11px] font-medium rounded-[3px] no-underline hover:bg-[#B91C1C] transition-colors"
              >
                Watch on YouTube
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M5 18l10-6L5 6v12z" /></svg>
              </a>
            </div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={`https://www.youtube.com/embed/${channel.youtubeId}?autoplay=1&mute=${isAudioSource ? '0' : '1'}&rel=0&modestbranding=1`}
          title={channel.name}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
          style={{ border: 0 }}
          onLoad={handleLoad}
          onError={() => setStatus('error')}
        />

        {/* Live badge */}
        {channel.status === 'live' && status !== 'error' && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 bg-[#DC2626]/90 backdrop-blur-sm rounded-[2px] z-20">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-dot" />
            <span className="font-mono text-white" style={{ fontSize: '9px', fontWeight: 700 }}>LIVE</span>
          </div>
        )}

        {/* Audio indicator */}
        <button
          onClick={onSetAudio}
          className={`absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] z-20 border-0 cursor-pointer transition-colors ${
            isAudioSource ? 'bg-white/90 text-[#111827]' : 'bg-black/50 text-white/70 hover:bg-black/70'
          }`}
          title={isAudioSource ? 'Audio active' : 'Click to route audio here'}
        >
          {isAudioSource ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" /></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" /></svg>
          )}
          <span className="font-mono" style={{ fontSize: '8px', fontWeight: 600 }}>
            {isAudioSource ? 'AUDIO' : 'MUTED'}
          </span>
        </button>
      </div>

      {/* Channel info bar */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-[#F3F4F6]">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[12px] font-semibold text-[#111827] truncate">{channel.name}</span>
          <BiasTag bias={channel.bias} />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono text-[9px] text-[#9CA3AF]">{channel.country}</span>
          <a
            href={channel.channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#9CA3AF] hover:text-[#DC2626] transition-colors"
            title="Open on YouTube"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" /></svg>
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── CHANNEL SELECTOR ───────────────────────────────────────────────────────────

function ChannelSelector({
  channels,
  selected,
  maxSlots,
  onToggle,
}: {
  channels: StreamChannel[];
  selected: string[];
  maxSlots: number;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="card p-3 mb-3">
      <div className="flex items-center justify-between mb-2">
        <SectionHeader>Select Streams</SectionHeader>
        <span className="font-mono text-[10px] text-[#9CA3AF]">
          {selected.length} / {maxSlots} slots
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {channels.map((ch) => {
          const active = selected.includes(ch.id);
          const full = selected.length >= maxSlots && !active;
          return (
            <button
              key={ch.id}
              onClick={() => !full && onToggle(ch.id)}
              disabled={full}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-[3px] border text-[11px] font-medium transition-all cursor-pointer ${
                active
                  ? 'bg-[#111827] text-white border-[#111827]'
                  : full
                    ? 'bg-[#F9FAFB] text-[#D1D5DB] border-[#F3F4F6] cursor-not-allowed'
                    : 'bg-white text-[#374151] border-[#E5E7EB] hover:border-[#9CA3AF]'
              }`}
            >
              {ch.status === 'live' && (
                <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-[#DC2626]' : 'bg-[#9CA3AF]'}`} />
              )}
              {ch.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────────

export default function LiveVideo() {
  const [layout, setLayout] = useState<Layout>('4');
  const maxSlots = Number(layout);

  // Default: first N channels
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    streamChannels.slice(0, 4).map((c) => c.id)
  );
  const [audioSourceId, setAudioSourceId] = useState<string>(streamChannels[0]?.id || '');

  // Adjust selection when layout shrinks
  useEffect(() => {
    if (selectedIds.length > maxSlots) {
      setSelectedIds((prev) => prev.slice(0, maxSlots));
    }
  }, [maxSlots, selectedIds.length]);

  const handleToggle = useCallback(
    (id: string) => {
      setSelectedIds((prev) => {
        if (prev.includes(id)) {
          const next = prev.filter((x) => x !== id);
          // If we removed the audio source, move audio to first remaining
          if (id === audioSourceId && next.length > 0) {
            setAudioSourceId(next[0]);
          }
          return next;
        }
        if (prev.length >= maxSlots) return prev;
        return [...prev, id];
      });
    },
    [maxSlots, audioSourceId],
  );

  const activeStreams = selectedIds
    .map((id) => streamChannels.find((c) => c.id === id))
    .filter(Boolean) as StreamChannel[];

  const layoutConfig = layouts.find((l) => l.key === layout) || layouts[2];

  return (
    <div className="max-w-[1800px] mx-auto px-3 sm:px-4 py-3 sm:py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <div className="flex items-center gap-3">
          <h1 className="text-[16px] sm:text-[18px] font-extrabold text-[#111827] tracking-[-0.5px] m-0">
            Live Video
          </h1>
          <span className="flex items-center gap-1 px-1.5 py-0.5 bg-[#DC2626] rounded-[2px]">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-dot" />
            <span className="font-mono text-white" style={{ fontSize: '9px', fontWeight: 700 }}>
              {streamChannels.filter((c) => c.status === 'live').length} LIVE
            </span>
          </span>
        </div>

        {/* Layout selector */}
        <div className="flex items-center gap-2">
          <span className="section-header" style={{ fontSize: '9px' }}>Layout:</span>
          <div className="flex gap-1">
            {layouts.map((l) => (
              <button
                key={l.key}
                onClick={() => setLayout(l.key)}
                className={`w-7 h-7 flex items-center justify-center font-mono text-[11px] font-bold rounded-[3px] border-0 cursor-pointer transition-colors ${
                  layout === l.key
                    ? 'bg-[#111827] text-white'
                    : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
                }`}
                title={`${l.key}-stream layout`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Channel Selector */}
      <ChannelSelector
        channels={streamChannels}
        selected={selectedIds}
        maxSlots={maxSlots}
        onToggle={handleToggle}
      />

      {/* Stream Grid */}
      {activeStreams.length > 0 ? (
        <div className={`grid ${layoutConfig.cols} gap-2 mb-4`}>
          {activeStreams.map((ch) => (
            <StreamPlayer
              key={ch.id}
              channel={ch}
              isAudioSource={ch.id === audioSourceId}
              onSetAudio={() => setAudioSourceId(ch.id)}
              isFeatured={layout === '1'}
            />
          ))}
        </div>
      ) : (
        <div className="card p-8 text-center mb-4">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="#D1D5DB" className="mx-auto mb-3">
            <path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zM9.5 12.5l3 3.5 2-2.5 3 4H6.5z" />
          </svg>
          <div className="text-[13px] text-[#6B7280]">Select streams above to start watching</div>
        </div>
      )}

      {/* Quick Links — all channels as cards */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <SectionHeader>All Channels</SectionHeader>
          <span className="font-mono text-[10px] text-[#9CA3AF]">
            {streamChannels.length} channels
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
          {streamChannels.map((ch) => {
            const isActive = selectedIds.includes(ch.id);
            return (
              <div
                key={ch.id}
                className={`flex items-center justify-between p-2.5 rounded-[4px] border transition-colors ${
                  isActive ? 'border-[#111827] bg-[#F9FAFB]' : 'border-[#F3F4F6] hover:border-[#E5E7EB]'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {ch.status === 'live' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-[#111827] truncate">{ch.name}</span>
                      <BiasTag bias={ch.bias} />
                    </div>
                    <div className="text-[10px] text-[#9CA3AF] truncate">{ch.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button
                    onClick={() => handleToggle(ch.id)}
                    disabled={!isActive && selectedIds.length >= maxSlots}
                    className={`px-2 py-1 text-[10px] font-mono font-semibold rounded-[3px] border-0 cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-[#111827] text-white'
                        : selectedIds.length >= maxSlots
                          ? 'bg-[#F3F4F6] text-[#D1D5DB] cursor-not-allowed'
                          : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
                    }`}
                  >
                    {isActive ? 'ON' : 'ADD'}
                  </button>
                  <a
                    href={ch.channelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-6 h-6 rounded-[3px] text-[#9CA3AF] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
                    title="Open on YouTube"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" /></svg>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
