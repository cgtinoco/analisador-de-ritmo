import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MetricCardProps {
  title: string;
  value: string | number;
  emoji: string;
  description: string;
  variant?: "success" | "warning" | "destructive" | "default";
}

export function MetricCard({ title, value, emoji, description, variant = "default" }: MetricCardProps) {
  const variantStyles = {
    success: "border-success/30 bg-gradient-to-br from-success/5 to-success/10",
    warning: "border-warning/30 bg-gradient-to-br from-warning/5 to-warning/10",
    destructive: "border-destructive/30 bg-gradient-to-br from-destructive/5 to-destructive/10",
    default: "border-border",
  };

  return (
    <Card className={`shadow-card transition-all hover:shadow-elevated ${variantStyles[variant]}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <span className="text-2xl">{emoji}</span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold mb-2">{value}</div>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}
