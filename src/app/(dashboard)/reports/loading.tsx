"use client";

export default function ReportsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="h-8 w-40 bg-muted/60 rounded-lg" />
          <div className="h-4 w-60 bg-muted/40 rounded mt-2" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-28 bg-muted/40 rounded-xl" />
          <div className="h-10 w-28 bg-muted/40 rounded-xl" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl bg-card/60 p-6 space-y-3 border border-border/30">
            <div className="h-4 w-24 bg-muted/50 rounded" />
            <div className="h-8 w-32 bg-muted/60 rounded-lg" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl bg-card/60 border border-border/30 h-64" />
    </div>
  );
}
