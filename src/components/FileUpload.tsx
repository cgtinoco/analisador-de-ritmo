import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { SwimmingTest } from "@/lib/swimmingAnalytics";

interface FileUploadProps {
  onDataLoaded: (data: SwimmingTest[]) => void;
}

export function FileUpload({ onDataLoaded }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n").filter((line) => line.trim());
      const headers = lines[0].split(",").map((h) => h.trim());

      const data: SwimmingTest[] = lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim());
        const obj: any = {};
        headers.forEach((header, idx) => {
          const value = values[idx];
          if (header.startsWith("t") && !isNaN(Number(value))) {
            obj[header] = parseFloat(value);
          } else if (header === "distance") {
            obj[header] = parseInt(value);
          } else {
            obj[header] = value;
          }
        });
        return obj as SwimmingTest;
      });

      onDataLoaded(data);
    };
    reader.readAsText(file);
  };

  return (
    <Card className="shadow-card">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full bg-primary/10 p-4">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold mb-1">Carregar dados CSV</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload de arquivo com colunas: athlete, date, event, distance, t1-t8
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button onClick={() => fileInputRef.current?.click()} className="w-full max-w-xs">
            Selecionar arquivo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
