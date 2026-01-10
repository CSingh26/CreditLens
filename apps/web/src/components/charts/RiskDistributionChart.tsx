"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const COLORS = ["#0f766e", "#f59e0b", "#e11d48"];

export interface RiskBucketDatum {
  name: string;
  value: number;
}

export function RiskDistributionChart({ data }: { data: RiskBucketDatum[] }) {
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius={50} outerRadius={80}>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: "0.75rem",
              borderColor: "#e2e8f0",
              background: "white",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
