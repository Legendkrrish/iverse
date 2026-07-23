"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

export default function DashboardBarChart({ chartData }: { chartData?: Array<{ name: string; GST: number; "Non-GST": number }> }) {
  const data = chartData && chartData.length > 0 ? chartData : [
    { name: "Mon", GST: 0, "Non-GST": 0 },
    { name: "Tue", GST: 0, "Non-GST": 0 },
    { name: "Wed", GST: 0, "Non-GST": 0 },
    { name: "Thu", GST: 0, "Non-GST": 0 },
    { name: "Fri", GST: 0, "Non-GST": 0 },
    { name: "Sat", GST: 0, "Non-GST": 0 },
    { name: "Sun", GST: 0, "Non-GST": 0 },
  ];

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
          <XAxis
            dataKey="name"
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `₹${value}`}
          />
          <Tooltip
            formatter={(value: any) => [`₹${Number(value).toLocaleString("en-IN")}`, ""]}
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              background: "#ffffff",
              color: "#000000",
              fontWeight: "600",
            }}
          />
          <Legend />
          <Bar
            dataKey="GST"
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
            name="GST TAX Invoice (₹)"
          />
          <Bar
            dataKey="Non-GST"
            fill="#f59e0b"
            radius={[4, 4, 0, 0]}
            name="Non-GST Invoice (₹)"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
