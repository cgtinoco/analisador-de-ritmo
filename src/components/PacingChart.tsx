import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface PacingChartProps {
  data: { lap: number; time: number }[];
  title?: string;
  athleteName?: string;
}

export function PacingChart({ data, title = "Pacing – parciais de 25m", athleteName }: PacingChartProps) {
  return (
    <div className="w-full h-[400px]">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="lap"
            label={{ value: "Lap (25m)", position: "insideBottom", offset: -5 }}
            className="text-xs"
          />
          <YAxis
            label={{ value: "Tempo (s)", angle: -90, position: "insideLeft" }}
            className="text-xs"
            domain={['dataMin - 0.5', 'dataMax + 0.5']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
          />
          {athleteName && <Legend />}
          <Line
            type="monotone"
            dataKey="time"
            stroke="hsl(var(--primary))"
            strokeWidth={3}
            dot={{ fill: "hsl(var(--primary))", r: 5 }}
            activeDot={{ r: 7 }}
            name={athleteName || "Tempo"}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
