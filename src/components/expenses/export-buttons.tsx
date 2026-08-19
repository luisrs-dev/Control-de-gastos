"use client";

import { Download } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

const formats = [
  { value: "csv", label: "CSV" },
  { value: "xlsx", label: "Excel" },
  { value: "pdf", label: "PDF" },
] as const;

export function ExportButtons() {
  const searchParams = useSearchParams();
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

  const download = (format: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("format", format);
    window.location.assign(`${basePath}/api/expenses/export?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap" aria-label="Exportar gastos">
      {formats.map((format) => (
        <Button key={format.value} type="button" variant="outline" size="sm" onClick={() => download(format.value)}>
          <Download className="w-3.5 h-3.5 mr-1.5" />
          {format.label}
        </Button>
      ))}
    </div>
  );
}
