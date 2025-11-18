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

interface ComparisonChartProps {
  data: { lap: number; athlete1: number; athlete2: number }[];
  athlete1Name: string;
  athlete2Name: string;
}

export function ComparisonChart({ data, athlete1Name, athlete2Name }: ComparisonChartProps) {
  return (
    <div className="w-full h-[400px]">
      <h3 className="text-lg font-semibold mb-4">Comparação de pacing (parciais de 25m)</h3>
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
          <Legend />
          <Line
            type="monotone"
            dataKey="athlete1"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: "hsl(var(--primary))", r: 4 }}
            name={athlete1Name}
          />
          <Line
            type="monotone"
            dataKey="athlete2"
            stroke="hsl(var(--accent))"
            strokeWidth={2}
            dot={{ fill: "hsl(var(--accent))", r: 4 }}
            name={athlete2Name}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
