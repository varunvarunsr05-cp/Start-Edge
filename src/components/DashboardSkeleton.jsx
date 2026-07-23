export default function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <div className="bg-panel border border-line rounded-lg p-5">
        <div className="h-6 w-40 skeleton rounded mb-2" />
        <div className="h-4 w-64 skeleton rounded" />
      </div>
      <div className="h-80 bg-panel border border-line rounded-lg skeleton" />
      <div className="grid md:grid-cols-2 gap-5">
        <div className="h-64 bg-panel border border-line rounded-lg skeleton" />
        <div className="h-64 bg-panel border border-line rounded-lg skeleton" />
      </div>
    </div>
  );
}
