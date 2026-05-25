"use client";

/**
 * JSON / 代码编辑器（Monaco Editor，VS Code 同款内核）
 */
import { useCallback } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import { cn } from "../../lib/utils";

export interface JsonCodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  /** 编辑器高度（px） */
  height?: number;
  language?: "json" | "javascript";
  className?: string;
  placeholder?: string;
}

export function JsonCodeEditor({
  value,
  onChange,
  readOnly = false,
  height = 240,
  language = "json",
  className,
  placeholder,
}: JsonCodeEditorProps) {
  const handleMount: OnMount = useCallback((editor, monaco) => {
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: language === "json",
      allowComments: false,
      schemas: [],
    });
    if (placeholder && !value) {
      editor.setValue("");
    }
  }, [language, placeholder, value]);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border bg-background",
        readOnly && "opacity-90",
        className
      )}
      data-slot="json-code-editor"
    >
      <Editor
        height={height}
        language={language}
        value={value}
        theme="light"
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 12,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          wordWrap: "on",
          automaticLayout: true,
          tabSize: 2,
          formatOnPaste: language === "json",
          formatOnType: language === "json",
        }}
        onChange={(v) => {
          if (!readOnly && onChange) {
            onChange(v ?? "");
          }
        }}
        onMount={handleMount}
        loading={
          <div
            className="flex items-center justify-center text-xs text-muted-foreground"
            style={{ height }}
          >
            加载编辑器…
          </div>
        }
      />
    </div>
  );
}
