"use client";

import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: true,
  theme: "default",
  securityLevel: "loose",
  fontFamily: "var(--font-sans), sans-serif",
});

interface MermaidDiagramProps {
  chart: string;
}

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const renderChart = async () => {
      if (!chart || !containerRef.current) return;
      
      // Sanitize chart code
      let cleanChart = chart.trim();
      cleanChart = cleanChart.replace(/```mermaid/g, "");
      cleanChart = cleanChart.replace(/```/g, "");
      cleanChart = cleanChart.replace(/\t/g, "  "); // replace tabs with spaces
      cleanChart = cleanChart.trim();

      if (!cleanChart) return;

      try {
        setError(null);
        
        // Timeout wrapper to prevent hanging forever
        const renderPromise = async () => {
          // In Mermaid v10+, it's safer to check parse first
          if (await mermaid.parse(cleanChart)) {
            const id = `mermaid-svg-${Math.round(Math.random() * 1000000)}`;
            const { svg } = await mermaid.render(id, cleanChart);
            return svg;
          }
          throw new Error("Parse failed");
        };

        const timeoutPromise = new Promise<string>((_, reject) => 
          setTimeout(() => reject(new Error("Mermaid render timed out")), 5000)
        );

        const svg = await Promise.race([renderPromise(), timeoutPromise]);

        if (isMounted) {
          setSvgContent(svg);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Mermaid Render Error:", err);
          setError(`خطأ في رسم الخريطة: ${err.message || 'صياغة غير صالحة'}`);
        }
      }
    };

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart]);

  if (error) {
    return (
      <div className="w-full p-4 border border-red-500/20 bg-red-500/5 text-red-500 rounded-xl text-sm">
        {error}
        <pre className="mt-2 text-xs opacity-70 overflow-x-auto" dir="ltr">
          {chart}
        </pre>
      </div>
    );
  }

  if (!svgContent) {
    return (
      <div className="w-full h-40 flex items-center justify-center border border-dashed border-black/10 dark:border-white/10 rounded-xl">
        <span className="text-sm text-soul-fg/40 dark:text-white/40">جاري رسم المخطط...</span>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="w-full overflow-x-auto flex justify-center py-4 bg-white dark:bg-slate-900 rounded-xl border border-black/5 dark:border-white/5"
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}
