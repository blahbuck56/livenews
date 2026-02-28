const biasConfig: Record<string, { bg: string; text: string }> = {
  neutral:     { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  western:     { bg: 'bg-blue-50', text: 'text-blue-700' },
  regional:    { bg: 'bg-amber-50', text: 'text-amber-700' },
  state:       { bg: 'bg-red-50', text: 'text-red-700' },
  osint:       { bg: 'bg-purple-50', text: 'text-purple-700' },
  independent: { bg: 'bg-teal-50', text: 'text-teal-700' },
  israeli:     { bg: 'bg-sky-50', text: 'text-sky-700' },
  opposition:  { bg: 'bg-orange-50', text: 'text-orange-700' },
};

export default function BiasTag({ bias }: { bias: string }) {
  const config = biasConfig[bias] || biasConfig.neutral;
  return (
    <span
      className={`inline-block ${config.bg} ${config.text}`}
      style={{
        padding: '2px 6px',
        borderRadius: '3px',
        fontSize: '9px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        lineHeight: '1.4',
      }}
    >
      {bias}
    </span>
  );
}
