import { useCombinedNews } from '../hooks/useNews';

export default function BreakingTicker() {
  const { articles } = useCombinedNews();
  const headlines = articles.slice(0, 10).map((a) => a.title);

  if (headlines.length === 0) return null;

  const tickerText = headlines.join('  ///  ');

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#FEF2F2] border-t border-[#FECACA] h-8 flex items-center overflow-hidden">
      <div className="shrink-0 px-3 bg-[#DC2626] h-full flex items-center">
        <span className="text-[10px] font-bold text-white tracking-wider">BREAKING</span>
      </div>
      <div className="overflow-hidden flex-1">
        <div className="animate-ticker whitespace-nowrap">
          <span className="text-xs text-[#991B1B] font-medium">
            {tickerText}  ///  {tickerText}
          </span>
        </div>
      </div>
    </div>
  );
}
