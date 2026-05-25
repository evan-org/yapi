"use client";

/**
 * 键值对参数表编辑（Query / Header 等）
 */
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export interface ParamRow {
  name: string;
  value?: string;
  example?: string;
  desc?: string;
  required?: string;
}

interface ParamTableEditorProps {
  rows: ParamRow[];
  onChange: (rows: ParamRow[]) => void;
  showRequired?: boolean;
}

export function ParamTableEditor({
  rows,
  onChange,
  showRequired = false,
}: ParamTableEditorProps) {
  function updateRow(idx: number, patch: Partial<ParamRow>) {
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
              <th className="px-2 py-1 text-left">值</th>
              <th className="px-2 py-1 text-left">示例</th>
              {showRequired ? <th className="px-2 py-1">必填</th> : null}
              <th className="px-2 py-1 w-16" />
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
                  <Input
                    className="h-8 text-xs"
                    value={row.value || ""}
                    onChange={(e) => updateRow(idx, { value: e.target.value })}
                  />
                </td>
                <td className="p-1">
                  <Input
                    className="h-8 text-xs"
                    value={row.example || ""}
                    onChange={(e) => updateRow(idx, { example: e.target.value })}
                  />
                </td>
                {showRequired ? (
                  <td className="p-1 text-center">
                    <input
                      type="checkbox"
                      checked={row.required === "1"}
                      onChange={(e) =>
                        updateRow(idx, { required: e.target.checked ? "1" : "0" })
                      }
                    />
                  </td>
                ) : null}
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
        onClick={() =>
          onChange([...rows, { name: "", value: "", example: "", required: "0" }])
        }
      >
        添加一行
      </Button>
    </div>
  );
}
