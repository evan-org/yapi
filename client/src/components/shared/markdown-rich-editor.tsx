"use client";

/**
 * Markdown 富文本编辑（@uiw/react-md-editor：分栏编辑 + 实时预览）
 */
import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { cn } from "../../lib/utils";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[280px] items-center justify-center rounded-md border bg-muted text-xs text-muted-foreground">
      加载 Markdown 编辑器…
    </div>
  ),
});

export interface MarkdownRichEditorProps {
  value: string;
  onChange: (value: string) => void;
  /** 编辑器最小高度（px） */
  height?: number;
  className?: string;
}

export function MarkdownRichEditor({
  value,
  onChange,
  height = 280,
  className,
}: MarkdownRichEditorProps) {
  return (
    <div className={cn("markdown-editor-root", className)} data-color-mode="light">
      <MDEditor
        value={value}
        onChange={(v) => onChange(v ?? "")}
        height={height}
        visibleDragbar={false}
        preview="live"
        textareaProps={{
          placeholder: "支持 Markdown 语法，可使用标题、列表、代码块等",
        }}
      />
    </div>
  );
}
