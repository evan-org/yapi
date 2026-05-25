"use client";

/**
 * JSON Schema 编辑：开关、Schema 文本、预览示例
 */
import { useState } from "react";
import { interfaceApi } from "../../lib/api/client";
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
      <div className="flex items-center justify-between gap-2">
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
          <Textarea
            className="font-mono text-xs"
            rows={6}
            readOnly={disabled}
            placeholder='{"type":"object","properties":{...}}'
            value={schemaText}
            onChange={(e) => onSchemaTextChange(e.target.value)}
          />
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
