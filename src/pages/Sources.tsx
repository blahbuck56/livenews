import { useState, useMemo } from 'react';
import { allSources } from '../data/sources';
import BiasTag from '../components/common/BiasTag';
import StatusDot from '../components/common/StatusDot';
import SectionHeader from '../components/common/SectionHeader';

const categories = ['wire', 'liveblog', 'regional', 'independent', 'video', 'osint', 'state', 'analysis', 'social'] as const;
const biases = ['neutral', 'western', 'regional', 'state', 'osint', 'independent', 'israeli', 'opposition'] as const;
const types = ['website', 'liveblog', 'youtube', 'twitter', 'osint-tool', 'think-tank', 'reddit'] as const;

const biasDescriptions: Record<string, string> = {
  neutral: 'Wire services and balanced international media — Reuters, AP, AFP, BBC, France 24, DW',
  western: 'US/European editorial perspective — CNN, NBC, CBS, NYT, WaPo, Guardian',
  regional: 'Middle East/Asian regional viewpoint — Al Jazeera, Arab News, TRT, The National',
  state: 'Government-controlled or funded media — IRNA, Press TV, Fars, Tasnim',
  osint: 'Open source intelligence and verification tools — Liveuamap, NetBlocks, FIRMS, Bellingcat',
  independent: 'Non-aligned investigative journalism — MEE, Intercept, +972, Mondoweiss',
  israeli: 'Israeli media and government sources — Times of Israel, Haaretz, i24NEWS, IDF',
  opposition: 'Iranian diaspora and opposition media — Iran International, IranWire',
};

export default function Sources() {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [biasFilter, setBiasFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  const filtered = useMemo(() => {
    return allSources.filter((s) => {
      if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.description.toLowerCase().includes(search.toLowerCase())) return false;
      if (catFilter !== 'all' && s.category !== catFilter) return false;
      if (biasFilter !== 'all' && s.bias !== biasFilter) return false;
      if (typeFilter !== 'all' && s.type !== typeFilter) return false;
      return true;
    });
  }, [search, catFilter, biasFilter, typeFilter]);

  const selectStyle = "px-3 py-1.5 text-[12px] border bg-white text-[#111827] cursor-pointer outline-none focus:border-[#6B7280] rounded-[4px]";

  return (
    <div className="max-w-[1800px] mx-auto px-4 py-4">
      <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', letterSpacing: '-0.5px', marginBottom: '16px' }}>Source Directory</h1>

      {/* Filters */}
      <div className="card p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-center">
          <input type="text" placeholder="Search sources..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1.5 text-[12px] border bg-white text-[#111827] placeholder-[#9CA3AF] w-56 outline-none focus:border-[#6B7280] rounded-[4px]" />
          <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className={selectStyle}>
            <option value="all">All Categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={biasFilter} onChange={(e) => setBiasFilter(e.target.value)} className={selectStyle}>
            <option value="all">All Bias</option>
            {biases.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={selectStyle}>
            <option value="all">All Types</option>
            {types.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <div className="flex border rounded-[4px] overflow-hidden ml-auto">
            <button onClick={() => setViewMode('card')} className={`px-3 py-1.5 text-[11px] font-medium cursor-pointer border-0 transition-colors ${viewMode === 'card' ? 'bg-[#111827] text-white' : 'bg-white text-[#6B7280] hover:bg-gray-50'}`}>Cards</button>
            <button onClick={() => setViewMode('table')} className={`px-3 py-1.5 text-[11px] font-medium cursor-pointer border-0 border-l transition-colors ${viewMode === 'table' ? 'bg-[#111827] text-white' : 'bg-white text-[#6B7280] hover:bg-gray-50'}`}>Table</button>
          </div>
          <span className="text-[10px] text-[#9CA3AF]">{filtered.length} sources</span>
        </div>
      </div>

      {/* Card View */}
      {viewMode === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
          {filtered.map((s) => (
            <div key={s.id} className="card p-4 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-shadow">
              <div className="flex items-start justify-between gap-2 mb-2">
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-[14px] font-semibold text-[#111827] hover:text-[#2563EB] no-underline">{s.name}</a>
                <BiasTag bias={s.bias} />
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                <span className="bg-gray-100 text-gray-600" style={{ padding: '1px 6px', borderRadius: '3px', fontSize: '9px', fontWeight: 600, textTransform: 'uppercase' }}>{s.category}</span>
                <span className="bg-gray-100 text-gray-600" style={{ padding: '1px 6px', borderRadius: '3px', fontSize: '9px', fontWeight: 600, textTransform: 'uppercase' }}>{s.type}</span>
                <span className="flex items-center gap-1"><StatusDot status={s.status} /><span className="text-[10px] text-[#6B7280]">{s.status}</span></span>
              </div>
              <p className="text-[11px] text-[#6B7280] leading-snug mb-2">{s.description}</p>
              <div className="text-[10px] text-[#9CA3AF]">{s.country}</div>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="card overflow-x-auto mb-8">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="section-header text-left py-2 px-3">Name</th>
                <th className="section-header text-left py-2 px-3">Category</th>
                <th className="section-header text-left py-2 px-3">Bias</th>
                <th className="section-header text-left py-2 px-3">Type</th>
                <th className="section-header text-left py-2 px-3">Country</th>
                <th className="section-header text-left py-2 px-3">Status</th>
                <th className="section-header text-left py-2 px-3">Description</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="py-2 px-3"><a href={s.url} target="_blank" rel="noopener noreferrer" className="text-[12px] font-medium text-[#2563EB] no-underline hover:underline">{s.name}</a></td>
                  <td className="py-2 px-3 text-[11px] text-[#6B7280]">{s.category}</td>
                  <td className="py-2 px-3"><BiasTag bias={s.bias} /></td>
                  <td className="py-2 px-3 text-[11px] text-[#6B7280]">{s.type}</td>
                  <td className="py-2 px-3 text-[11px] text-[#6B7280]">{s.country}</td>
                  <td className="py-2 px-3"><span className="flex items-center gap-1"><StatusDot status={s.status} /><span className="text-[10px]">{s.status}</span></span></td>
                  <td className="py-2 px-3 text-[11px] text-[#6B7280] max-w-[300px]">{s.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Bias Legend */}
      <div className="card p-4">
        <SectionHeader>Bias Tag Legend</SectionHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
          {Object.entries(biasDescriptions).map(([bias, desc]) => (
            <div key={bias} className="flex items-start gap-2">
              <div className="mt-0.5 shrink-0"><BiasTag bias={bias} /></div>
              <div className="text-[11px] text-[#6B7280] leading-snug">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
