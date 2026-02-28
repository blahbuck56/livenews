const statusColors: Record<string, string> = {
  live: 'bg-green-500',
  active: 'bg-amber-500',
  intermittent: 'bg-gray-400',
};

export default function StatusDot({ status }: { status: string }) {
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${statusColors[status] || 'bg-gray-400'}`} />
  );
}
