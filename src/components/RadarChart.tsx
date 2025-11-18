import {
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface RadarChartProps {
  data: { category: string; value: number }[];
  title?: string;
}

export function RadarChart({ data, title = "Radar de perfil de prova" }: RadarChartProps) {
  return (
    <div className="w-full h-[400px]">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadar data={data}>
          <PolarGrid className="stroke-muted" />
          <PolarAngleAxis
            dataKey="category"
            className="text-xs"
            tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
          />
          <PolarRadiusAxis angle={90} domain={[0, 100]} className="text-xs" />
          <Radar
            name="Score"
            dataKey="value"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.5}
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
          />
        </RechartsRadar>
      </ResponsiveContainer>
    </div>
  );
}
