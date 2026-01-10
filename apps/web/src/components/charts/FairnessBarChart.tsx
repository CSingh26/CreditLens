"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface FairnessDatum {
  group: string;
  tpr: number;
  fpr: number;
}

export function FairnessBarChart({ data }: { data: FairnessDatum[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="group" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              borderRadius: "0.75rem",
              borderColor: "#e2e8f0",
              background: "white",
            }}
          />
          <Bar dataKey="tpr" fill="#0f766e" radius={[6, 6, 0, 0]} />
          <Bar dataKey="fpr" fill="#f59e0b" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
