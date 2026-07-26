export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Skeleton Title */}
      <div className="h-8 w-64 bg-muted rounded-md" />
      <div className="h-4 w-96 bg-muted rounded-md" />

      {/* Skeleton Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass rounded-xl p-6 space-y-3">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-8 w-32 bg-muted rounded" />
            <div className="h-3 w-20 bg-muted rounded" />
          </div>
        ))}
      </div>

      {/* Skeleton Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="glass rounded-xl p-6 h-80 flex items-center justify-center">
            <div className="w-full h-full bg-muted/50 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}