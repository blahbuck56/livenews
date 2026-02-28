import { useState, useMemo } from 'react';
import { allSources, biasColors } from '../data/sources';
import BiasTag from '../components/BiasTag';
import type { SourceCategory, BiasTag as BiasTagType } from '../types';

const categories: SourceCategory[] = [
  'Wire Service', 'Live Blog', 'TV', 'Middle East & Regional',
  'Independent & Diaspora', 'YouTube Live', 'OSINT & Tools',
  'State Media', 'Think Tank', 'Twitter/X', 'Subreddit',
];

const biases: BiasTagType[] = [
  'Neutral', 'Western', 'Regional', 'State', 'Independent', 'OSINT', 'Israeli', 'Opposition',
];

export default function Sources() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [biasFilter, setBiasFilter] = useState<string>('all');

  const filteredSources = useMemo(() => {
    return allSources.filter((s) => {
      if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.description.toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryFilter !== 'all' && s.category !== categoryFilter) return false;
      if (biasFilter !== 'all' && s.bias !== biasFilter) return false;
      return true;
    });
  }, [search, categoryFilter, biasFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <h1 className="text-lg font-bold text-[#111827] mb-4">Source Directory</h1>

      {/* Filters */}
      <div className="bg-white border border-[#E5E7EB] rounded-[6px] p-4 mb-4">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search sources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1.5 text-xs border border-[#E5E7EB] rounded bg-white text-[#111827] placeholder-[#9CA3AF] w-64 outline-none focus:border-[#6B7280]"
            style={{ borderRadius: '4px' }}
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-[#E5E7EB] rounded bg-white text-[#111827] cursor-pointer outline-none"
            style={{ borderRadius: '4px' }}
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={biasFilter}
            onChange={(e) => setBiasFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-[#E5E7EB] rounded bg-white text-[#111827] cursor-pointer outline-none"
            style={{ borderRadius: '4px' }}
          >
            <option value="all">All Bias Tags</option>
            {biases.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          <span className="text-[10px] text-[#9CA3AF] self-center">{filteredSources.length} sources</span>
        </div>
      </div>

      {/* Source Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        {filteredSources.map((source, i) => (
          <div key={i} className="bg-white border border-[#E5E7EB] rounded-[6px] p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[#111827] hover:text-[#2563EB] no-underline">
                {source.name}
              </a>
              <BiasTag bias={source.bias} />
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              <span className="px-1.5 py-0.5 text-[10px] bg-[#F3F4F6] text-[#6B7280] rounded" style={{ borderRadius: '3px' }}>
                {source.category}
              </span>
              <span className="px-1.5 py-0.5 text-[10px] bg-[#F3F4F6] text-[#6B7280] rounded" style={{ borderRadius: '3px' }}>
                {source.type}
              </span>
              <span className={`px-1.5 py-0.5 text-[10px] rounded font-medium ${
                source.status === 'Live' ? 'bg-[#DCFCE7] text-[#16A34A]' :
                source.status === 'Active' ? 'bg-[#DBEAFE] text-[#2563EB]' :
                'bg-[#FEF3C7] text-[#D97706]'
              }`} style={{ borderRadius: '3px' }}>
                {source.status}
              </span>
            </div>
            <p className="text-[11px] text-[#6B7280] leading-snug mb-2">{source.description}</p>
            <div className="text-[10px] text-[#9CA3AF]">{source.country}</div>
          </div>
        ))}
      </div>

      {/* Bias Legend */}
      <div className="bg-white border border-[#E5E7EB] rounded-[6px] p-4">
        <h3 className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-3">Bias Tag Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(biasColors).map(([bias, color]) => (
            <div key={bias} className="flex items-start gap-2">
              <span
                className="shrink-0 mt-0.5 w-3 h-3 rounded"
                style={{ backgroundColor: color, borderRadius: '3px' }}
              />
              <div>
                <div className="text-xs font-medium text-[#111827]">{bias}</div>
                <div className="text-[10px] text-[#9CA3AF]">
                  {bias === 'Neutral' && 'Wire services and balanced international media'}
                  {bias === 'Western' && 'US/European editorial perspective'}
                  {bias === 'Regional' && 'Middle East/Asian regional viewpoint'}
                  {bias === 'State' && 'Government-controlled or funded media'}
                  {bias === 'Independent' && 'Non-aligned investigative journalism'}
                  {bias === 'OSINT' && 'Open source intelligence and verification tools'}
                  {bias === 'Israeli' && 'Israeli media and government sources'}
                  {bias === 'Opposition' && 'Iranian diaspora and opposition media'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
