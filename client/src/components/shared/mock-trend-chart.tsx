"use client";

/**
 * Mock 请求趋势简易柱状图（基于 mockDateList 聚合数据）
 */

export interface MockTrendPoint {
  date: string;
  count: number;
}

interface MockTrendChartProps {
  points: MockTrendPoint[];
  height?: number;
}

export function MockTrendChart({ points, height = 160 }: MockTrendChartProps) {
  if (!points.length) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">暂无 Mock 趋势数据</p>
    );
  }

  const sorted = [...points].sort((a, b) => a.date.localeCompare(b.date));
  const max = Math.max(...sorted.map((p) => p.count), 1);
  const barWidth = Math.max(8, Math.min(32, Math.floor(600 / sorted.length)));

  return (
    <div className="space-y-2">
      <div
        className="flex items-end gap-1 overflow-x-auto border-b pb-1"
        style={{ height }}
        role="img"
        aria-label="Mock 请求趋势图"
      >
        {sorted.map((p) => {
          const h = Math.round((p.count / max) * (height - 24));
          return (
            <div
              key={p.date}
              className="flex flex-col items-center shrink-0"
              style={{ width: barWidth }}
              title={`${p.date}: ${p.count}`}
            >
              <span className="mb-1 text-[10px] text-muted-foreground">{p.count}</span>
              <div
                className="w-full rounded-t bg-[#2395f1]/80 min-h-[2px]"
                style={{ height: Math.max(h, 2) }}
              />
              <span className="mt-1 text-[9px] text-muted-foreground rotate-[-45deg] origin-top-left whitespace-nowrap">
                {p.date.slice(5)}
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        近 {sorted.length} 天 Mock 调用次数（悬停查看详情）
      </p>
    </div>
  );
}

/** 将插件 API 返回的 mockDateList 规范为图表点 */
export function normalizeMockDateList(raw: unknown[]): MockTrendPoint[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw
    .map((item) => {
      const row = item as { _id?: string; date?: string; count?: number };
      const date = String(row._id || row.date || "");
      const count = Number(row.count) || 0;
      return { date, count };
    })
    .filter((p) => p.date);
}
