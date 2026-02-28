export default function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="bg-white border border-[#FECACA] rounded-[6px] p-6 text-center">
      <div className="text-[#DC2626] text-sm font-medium mb-2">Unable to fetch data</div>
      <div className="text-[#6B7280] text-xs mb-3">{message}</div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3 py-1.5 text-xs font-medium text-[#DC2626] border border-[#FECACA] rounded bg-white hover:bg-[#FEF2F2] cursor-pointer"
          style={{ borderRadius: '4px' }}
        >
          Retry
        </button>
      )}
    </div>
  );
}
