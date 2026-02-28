export default function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="card border-red-200 p-6 text-center">
      <div className="text-[13px] font-semibold text-[#DC2626] mb-1">Unable to fetch data</div>
      <div className="text-[12px] text-[#6B7280] mb-3">{message}</div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3 py-1.5 text-[11px] font-medium text-[#DC2626] border border-red-200 bg-white hover:bg-red-50 cursor-pointer transition-colors rounded-[4px]"
        >
          Retry
        </button>
      )}
    </div>
  );
}
