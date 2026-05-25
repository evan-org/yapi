"use client";

/**
 * JSON Schema 编辑：开关、可视化表格 / 源码文本、预览示例
 */
import { useEffect, useState } from "react";
import { interfaceApi } from "../../lib/api/client";
import {
  parseSchemaTextToRows,
  rowsToSchemaText,
  type SchemaVisualRow,
} from "../../lib/json-schema-visual";
import { JsonSchemaVisualEditor } from "./json-schema-visual-editor";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Alert, AlertDescription } from "../ui/alert";

interface JsonSchemaFieldProps {
  label: string;
  enabled: boolean;
  onEnabledChange: (v: boolean) => void;
  schemaText: string;
  onSchemaTextChange: (v: string) => void;
  disabled?: boolean;
}

export function JsonSchemaField({
  label,
  enabled,
  onEnabledChange,
  schemaText,
  onSchemaTextChange,
  disabled = false,
}: JsonSchemaFieldProps) {
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"visual" | "raw">("visual");
  const [visualRows, setVisualRows] = useState<SchemaVisualRow[]>([]);

  /** 外部 schema 文本变化时同步可视化行 */
  useEffect(() => {
    if (!enabled) {
      return;
    }
    setVisualRows(parseSchemaTextToRows(schemaText));
  }, [enabled, schemaText]);

  function syncVisualToText(rows: SchemaVisualRow[]) {
    setVisualRows(rows);
    try {
      const text = rowsToSchemaText(rows);
      onSchemaTextChange(text);
      setError("");
    } catch (err) {
      console.error("Schema 序列化失败", err);
      setError(err instanceof Error ? err.message : "Schema 序列化失败");
    }
  }

  async function handlePreview() {
    setError("");
    setPreview("");
    setLoading(true);
    try {
      const schema = JSON.parse(schemaText || "{}");
      const res = await interfaceApi.schema2json(schema, true);
      setPreview(JSON.stringify(res, null, 2));
      console.log("Schema 预览生成成功", label);
    } catch (err) {
      console.error("Schema 预览失败", err);
      setError(err instanceof Error ? err.message : "预览失败，请检查 JSON Schema 格式");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2 rounded-lg border p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label>{label}</Label>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={enabled}
            disabled={disabled}
            onChange={(e) => onEnabledChange(e.target.checked)}
          />
          使用 JSON Schema
        </label>
      </div>
      {enabled ? (
        <>
          {!disabled ? (
            <div className="flex gap-2 text-xs">
              <Button
                type="button"
                size="sm"
                variant={mode === "visual" ? "default" : "outline"}
                onClick={() => setMode("visual")}
              >
                可视化
              </Button>
              <Button
                type="button"
                size="sm"
                variant={mode === "raw" ? "default" : "outline"}
                onClick={() => setMode("raw")}
              >
                源码
              </Button>
            </div>
          ) : null}
          {mode === "visual" ? (
            <JsonSchemaVisualEditor
              rows={visualRows}
              onChange={syncVisualToText}
              disabled={disabled}
            />
          ) : (
            <Textarea
              className="font-mono text-xs"
              rows={6}
              readOnly={disabled}
              placeholder='{"type":"object","properties":{...}}'
              value={schemaText}
              onChange={(e) => onSchemaTextChange(e.target.value)}
            />
          )}
          {!disabled ? (
            <Button type="button" size="sm" variant="outline" onClick={handlePreview} disabled={loading}>
              {loading ? "生成中…" : "预览示例 JSON"}
            </Button>
          ) : null}
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          {preview ? (
            <Textarea readOnly rows={6} className="font-mono text-xs bg-muted" value={preview} />
          ) : null}
        </>
      ) : (
        <p className="text-xs text-muted-foreground">关闭时使用下方普通 Body 文本</p>
      )}
    </div>
  );
}
