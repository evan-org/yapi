"use client";

/**
 * Markdown 只读渲染（react-markdown + GFM）
 */
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "../../lib/utils";

export interface MarkdownPreviewProps {
  content: string;
  className?: string;
  emptyHint?: string;
}

export function MarkdownPreview({
  content,
  className,
  emptyHint = "暂无内容",
}: MarkdownPreviewProps) {
  if (!content?.trim()) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>{emptyHint}</p>
    );
  }

  return (
    <div
      className={cn(
        "prose prose-sm max-w-none rounded-md border bg-muted/30 p-4 dark:prose-invert",
        "prose-headings:font-semibold prose-pre:bg-muted prose-code:text-primary",
        className
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
