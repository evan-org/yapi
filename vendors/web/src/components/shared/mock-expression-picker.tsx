"use client";

/**
 * Mock / 变量表达式快捷插入（测试用例参数）
 */
import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const MOCK_SNIPPETS = [
  { label: "随机整数", value: "@integer" },
  { label: "随机字符串", value: "@string" },
  { label: "邮箱", value: "@email" },
  { label: "时间戳", value: "@timestamp" },
  { label: "UUID", value: "@guid" },
];

const VAR_HINT =
  "变量格式：$.{用例key}.params.{字段} 或 $.{用例key}.body.{json路径}，用于引用前面用例的请求/响应。";

interface MockExpressionPickerProps {
  /** 点击片段时回调，由父组件写入当前输入框 */
  onInsert: (text: string) => void;
  caseKey?: number;
}

export function MockExpressionPicker({ onInsert, caseKey }: MockExpressionPickerProps) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
        插入 Mock / 变量
      </Button>
    );
  }

  return (
    <Card className="border-dashed">
      <CardHeader className="py-3">
        <CardTitle className="text-sm">表达式助手</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pb-4 text-xs">
        <p className="text-muted-foreground">{VAR_HINT}</p>
        <div className="flex flex-wrap gap-2">
          {MOCK_SNIPPETS.map((s) => (
            <Button
              key={s.value}
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => {
                onInsert(s.value);
                console.log("插入 Mock", s.value);
              }}
            >
              {s.label}
            </Button>
          ))}
          {caseKey ? (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => onInsert(`$.${caseKey}.body.`)}
            >
              引用本用例 body
            </Button>
          ) : null}
        </div>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
          收起
        </Button>
      </CardContent>
    </Card>
  );
}
