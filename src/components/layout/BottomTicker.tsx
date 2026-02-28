import { useCombinedNews } from '../../hooks/useGdeltArticles';

export default function BottomTicker() {
  const { articles } = useCombinedNews();
  const headlines = articles.slice(0, 8).map((a) => a.title);

  if (headlines.length === 0) return null;

  const tickerText = headlines.join(' \u25CF ');

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#FEF2F2] border-t border-[#FECACA] flex items-center overflow-hidden"
      style={{ height: '32px' }}
    >
      <div className="shrink-0 px-3 bg-[#DC2626] h-full flex items-center">
        <span className="font-mono text-white" style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          BREAKING
        </span>
      </div>
      <div className="overflow-hidden flex-1">
        <div className="animate-ticker whitespace-nowrap">
          <span className="font-mono text-[#DC2626]" style={{ fontSize: '11px', letterSpacing: '0.3px' }}>
            {tickerText} &nbsp;&nbsp;&nbsp; {tickerText}
          </span>
        </div>
      </div>
    </div>
  );
}
