import { biasColors } from '../data/sources';

export default function BiasTag({ bias }: { bias: string }) {
  const color = biasColors[bias] || '#6B7280';

  return (
    <span
      className="inline-block px-1.5 py-0.5 text-[10px] font-medium rounded"
      style={{ backgroundColor: color + '18', color, borderRadius: '3px' }}
    >
      {bias}
    </span>
  );
}
