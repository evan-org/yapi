/**
 * HTTP 方法标签
 */
import { cn } from "../../lib/utils";

const METHOD_STYLES: Record<string, string> = {
  GET: "bg-green-100 text-green-800",
  POST: "bg-blue-100 text-blue-800",
  PUT: "bg-amber-100 text-amber-800",
  DELETE: "bg-red-100 text-red-800",
  PATCH: "bg-purple-100 text-purple-800",
  HEAD: "bg-gray-100 text-gray-700",
  OPTIONS: "bg-gray-100 text-gray-700",
};

export function MethodBadge({ method }: { method: string }) {
  const m = (method || "GET").toUpperCase();
  return (
    <span
      className={cn(
        "inline-flex min-w-[52px] justify-center rounded px-1.5 py-0.5 font-mono text-xs font-semibold",
        METHOD_STYLES[m] || "bg-muted text-muted-foreground"
      )}
    >
      {m}
    </span>
  );
}
