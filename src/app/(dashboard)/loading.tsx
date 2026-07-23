"use client";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Page Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="h-8 w-56 bg-muted/60 rounded-lg" />
          <div className="h-4 w-72 bg-muted/40 rounded mt-2" />
        </div>
      </div>

      {/* Stat Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl bg-card/60 p-6 space-y-3 border border-border/30">
            <div className="h-4 w-24 bg-muted/50 rounded" />
            <div className="h-8 w-32 bg-muted/60 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Chart / Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-card/60 p-6 border border-border/30 h-72" />
        <div className="rounded-2xl bg-card/60 p-6 border border-border/30 h-72" />
      </div>
    </div>
  );
}
