"use client";

import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LazyBarChart = dynamic(
  () => import("./DashboardBarChart"),
  {
    loading: () => (
      <div className="h-[320px] w-full flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground text-sm">Loading chart...</div>
      </div>
    ),
    ssr: false,
  }
);

export function DashboardCharts({ chartData }: { chartData?: Array<{ name: string; GST: number; "Non-GST": number }> }) {
  return (
    <div className="grid gap-4 md:grid-cols-1">
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Weekly Sales Breakdown (GST vs Non-GST)</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <LazyBarChart chartData={chartData} />
        </CardContent>
      </Card>
    </div>
  );
}
