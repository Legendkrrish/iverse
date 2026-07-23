"use client";

export default function InventoryLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="h-8 w-48 bg-muted/60 rounded-lg" />
          <div className="h-4 w-64 bg-muted/40 rounded mt-2" />
        </div>
        <div className="h-10 w-36 bg-primary/20 rounded-xl" />
      </div>
      <div className="rounded-2xl bg-card/60 border border-border/30 overflow-hidden">
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-5 w-8 bg-muted/40 rounded" />
              <div className="h-5 flex-1 bg-muted/50 rounded" />
              <div className="h-5 w-20 bg-muted/40 rounded" />
              <div className="h-5 w-16 bg-muted/40 rounded" />
              <div className="h-5 w-24 bg-muted/50 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
