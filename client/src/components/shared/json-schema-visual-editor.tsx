"use client";

/**
 * JSON Schema 可视化表格编辑（字段名、类型、必填、描述、Mock 等）
 */
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import {
  createEmptySchemaRow,
  getSchemaTypeOptions,
  type SchemaVisualRow,
} from "../../lib/json-schema-visual";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface JsonSchemaVisualEditorProps {
  rows: SchemaVisualRow[];
  onChange: (rows: SchemaVisualRow[]) => void;
  disabled?: boolean;
  /** 嵌套层级，用于缩进 */
  depth?: number;
}

export function JsonSchemaVisualEditor({
  rows,
  onChange,
  disabled = false,
  depth = 0,
}: JsonSchemaVisualEditorProps) {
  function updateRow(idx: number, patch: Partial<SchemaVisualRow>) {
    const next = [...rows];
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  }

  function removeRow(idx: number) {
    onChange(rows.filter((_, i) => i !== idx));
  }

  function addRow() {
    onChange([...rows, createEmptySchemaRow()]);
  }

  function updateChildren(idx: number, children: SchemaVisualRow[]) {
    const next = [...rows];
    next[idx] = { ...next[idx], children };
    onChange(next);
  }

  function toggleChild(idx: number) {
    const row = rows[idx];
    const children = row.children || [];
    updateRow(idx, { children: children.length ? undefined : [createEmptySchemaRow()] });
  }

  if (rows.length === 0 && !disabled) {
    return (
      <Button type="button" size="sm" variant="outline" onClick={addRow}>
        <Plus className="mr-1 h-3 w-3" />
        添加字段
      </Button>
    );
  }

  const typeOptions = getSchemaTypeOptions();

  return (
    <div className="space-y-2" style={{ marginLeft: depth > 0 ? depth * 12 : 0 }}>
      <div className="overflow-x-auto rounded border text-xs">
        <table className="w-full min-w-[640px]">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-2 py-1 text-left w-8" />
              <th className="px-2 py-1 text-left">字段名</th>
              <th className="px-2 py-1 text-left w-24">类型</th>
              <th className="px-2 py-1 text-center w-12">必填</th>
              <th className="px-2 py-1 text-left">说明</th>
              <th className="px-2 py-1 text-left w-24">默认值</th>
              <th className="px-2 py-1 text-left w-28">Mock</th>
              <th className="px-2 py-1 w-10" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <SchemaRowBlock
                key={row.id}
                row={row}
                idx={idx}
                disabled={disabled}
                typeOptions={typeOptions}
                onUpdate={(patch) => updateRow(idx, patch)}
                onRemove={() => removeRow(idx)}
                onToggleChild={() => toggleChild(idx)}
                onChildrenChange={(children) => updateChildren(idx, children)}
              />
            ))}
          </tbody>
        </table>
      </div>
      {!disabled ? (
        <Button type="button" size="sm" variant="outline" onClick={addRow}>
          <Plus className="mr-1 h-3 w-3" />
          添加字段
        </Button>
      ) : null}
    </div>
  );
}

interface SchemaRowBlockProps {
  row: SchemaVisualRow;
  idx: number;
  disabled: boolean;
  typeOptions: string[];
  onUpdate: (patch: Partial<SchemaVisualRow>) => void;
  onRemove: () => void;
  onToggleChild: () => void;
  onChildrenChange: (children: SchemaVisualRow[]) => void;
}

function SchemaRowBlock({
  row,
  disabled,
  typeOptions,
  onUpdate,
  onRemove,
  onToggleChild,
  onChildrenChange,
}: SchemaRowBlockProps) {
  const hasNested = row.type === "object" || row.type === "array";
  const expanded = Boolean(row.children);

  return (
    <>
      <tr className="border-t">
        <td className="p-1 text-center">
          {hasNested ? (
            <button
              type="button"
              className="inline-flex text-muted-foreground"
              disabled={disabled}
              onClick={onToggleChild}
              title={expanded ? "收起子字段" : "展开子字段"}
            >
              {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          ) : null}
        </td>
        <td className="p-1">
          <Input
            className="h-8 text-xs"
            value={row.name}
            readOnly={disabled}
            placeholder="name"
            onChange={(e) => onUpdate({ name: e.target.value })}
          />
        </td>
        <td className="p-1">
          <select
            className="h-8 w-full rounded-md border px-1 text-xs"
            value={row.type}
            disabled={disabled}
            onChange={(e) => onUpdate({ type: e.target.value })}
          >
            {typeOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </td>
        <td className="p-1 text-center">
          <input
            type="checkbox"
            checked={row.required}
            disabled={disabled}
            onChange={(e) => onUpdate({ required: e.target.checked })}
          />
        </td>
        <td className="p-1">
          <Input
            className="h-8 text-xs"
            value={row.description}
            readOnly={disabled}
            onChange={(e) => onUpdate({ description: e.target.value })}
          />
        </td>
        <td className="p-1">
          <Input
            className="h-8 text-xs"
            value={row.defaultValue}
            readOnly={disabled}
            onChange={(e) => onUpdate({ defaultValue: e.target.value })}
          />
        </td>
        <td className="p-1">
          <Input
            className="h-8 text-xs font-mono"
            value={row.mock}
            readOnly={disabled}
            placeholder="@string"
            onChange={(e) => onUpdate({ mock: e.target.value })}
          />
        </td>
        <td className="p-1">
          {!disabled ? (
            <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={onRemove}>
              <Trash2 className="h-3 w-3" />
            </Button>
          ) : null}
        </td>
      </tr>
      {expanded && row.children ? (
        <tr className="border-t bg-muted/20">
          <td colSpan={8} className="p-2">
            <p className="mb-2 text-[10px] text-muted-foreground">
              {row.type === "array" ? "数组 items 结构" : "对象 properties"}
            </p>
            <JsonSchemaVisualEditor
              rows={row.children}
              onChange={onChildrenChange}
              disabled={disabled}
              depth={1}
            />
          </td>
        </tr>
      ) : null}
    </>
  );
}
