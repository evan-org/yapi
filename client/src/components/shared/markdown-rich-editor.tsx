"use client";

/**
 * Markdown 富文本编辑（@mdxeditor/editor：Lexical + 工具栏，替代历史 tui-editor）
 */
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { cn } from "../../lib/utils";

const MdxEditorInner = dynamic(() => import("./mdx-editor-inner"), {
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
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div
      className={cn(
        "markdown-editor-root overflow-hidden rounded-md border",
        isDark && "dark-theme",
        className
      )}
      style={{ minHeight: height }}
    >
      <MdxEditorInner
        value={value}
        onChange={onChange}
        className="mdx-editor-themed"
        contentEditableClassName="mdx-editor-content prose prose-sm max-w-none dark:prose-invert min-h-[200px] px-3 py-2"
      />
    </div>
  );
}
