"use client";

/**
 * form 类型请求体参数表（name / 类型 / 值）
 */
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export interface FormBodyRow {
  name: string;
  type: string;
  value?: string;
  example?: string;
  desc?: string;
}

interface FormBodyEditorProps {
  rows: FormBodyRow[];
  onChange: (rows: FormBodyRow[]) => void;
}

export function FormBodyEditor({ rows, onChange }: FormBodyEditorProps) {
  function updateRow(idx: number, patch: Partial<FormBodyRow>) {
    const next = [...rows];
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  }

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded border text-xs">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-2 py-1 text-left">名称</th>
              <th className="px-2 py-1 text-left">类型</th>
              <th className="px-2 py-1 text-left">值 / Mock</th>
              <th className="w-16" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-1">
                  <Input
                    className="h-8 text-xs"
                    value={row.name}
                    onChange={(e) => updateRow(idx, { name: e.target.value })}
                  />
                </td>
                <td className="p-1">
                  <select
                    className="h-8 w-full rounded border px-1 text-xs"
                    value={row.type || "text"}
                    onChange={(e) => updateRow(idx, { type: e.target.value })}
                  >
                    <option value="text">text</option>
                    <option value="file">file</option>
                  </select>
                </td>
                <td className="p-1">
                  <Input
                    className="h-8 text-xs"
                    value={row.value || row.example || ""}
                    onChange={(e) => updateRow(idx, { value: e.target.value })}
                    placeholder="@email 等 Mock"
                  />
                </td>
                <td className="p-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onChange(rows.filter((_, i) => i !== idx))}
                  >
                    删
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...rows, { name: "", type: "text", value: "" }])}
      >
        添加表单项
      </Button>
    </div>
  );
}
