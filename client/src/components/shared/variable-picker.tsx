"use client";

/**
 * Postman 式变量选择器：环境全局变量、Mock 表达式、用例链式引用、双花括号占位
 */
import { ChevronDown } from "lucide-react";
import type { ProjectEnvItem } from "../../lib/api/types";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

/** Mock.js 常用片段 */
const MOCK_SNIPPETS = [
  { label: "随机整数", value: "@integer" },
  { label: "随机字符串", value: "@string" },
  { label: "邮箱", value: "@email" },
  { label: "时间戳", value: "@timestamp" },
  { label: "UUID", value: "@guid" },
  { label: "手机号", value: "@phone" },
  { label: "中文姓名", value: "@cname" },
];

export interface VariablePickerCaseRef {
  key: number;
  label: string;
}

interface VariablePickerProps {
  /** 选中变量后插入到目标输入框 */
  onInsert: (text: string) => void;
  /** 项目环境列表（含 global） */
  envs?: ProjectEnvItem[];
  /** 当前选中的环境索引 */
  envIndex?: number;
  /** 可引用的前置用例 */
  caseRefs?: VariablePickerCaseRef[];
  /** 当前用例 id（用于快捷 body 引用） */
  caseKey?: number;
  /** 触发按钮文案 */
  triggerLabel?: string;
  size?: "sm" | "default";
}

export function VariablePicker({
  onInsert,
  envs = [],
  envIndex = 0,
  caseRefs = [],
  caseKey,
  triggerLabel = "插入变量",
  size = "sm",
}: VariablePickerProps) {
  const env = envs[envIndex];
  const globals = (env?.global || []) as { name?: string; value?: string }[];
  const headers = (env?.header || []) as { name?: string; value?: string }[];

  function insert(text: string) {
    onInsert(text);
    console.log("插入变量", text);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" size={size} variant="outline">
          {triggerLabel}
          <ChevronDown className="ml-1 h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-80 w-64 overflow-y-auto">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          环境：{env?.name || "未选择"}
        </DropdownMenuLabel>
        {globals.length > 0 ? (
          <>
            <DropdownMenuLabel>全局变量 global.*</DropdownMenuLabel>
            {globals.map((g) =>
              g.name ? (
                <DropdownMenuItem
                  key={`global-${g.name}`}
                  onClick={() => insert(`global.${g.name}`)}
                >
                  <span className="font-mono text-xs">global.{g.name}</span>
                  {g.value ? (
                    <span className="ml-2 truncate text-muted-foreground">= {g.value}</span>
                  ) : null}
                </DropdownMenuItem>
              ) : null
            )}
            <DropdownMenuSeparator />
          </>
        ) : null}
        {headers.length > 0 ? (
          <>
            <DropdownMenuLabel>环境 Header</DropdownMenuLabel>
            {headers.map((h, i) =>
              h.name ? (
                <DropdownMenuItem key={`hdr-${i}`} onClick={() => insert(`{{ ${h.name} }}`)}>
                  <span className="font-mono text-xs">{`{{ ${h.name} }}`}</span>
                </DropdownMenuItem>
              ) : null
            )}
            <DropdownMenuSeparator />
          </>
        ) : null}
        <DropdownMenuLabel>Postman 占位符</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => insert("{{ $timestamp }}")}>
          <span className="font-mono text-xs">{`{{ $timestamp }}`}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => insert("{{ $randomInt }}")}>
          <span className="font-mono text-xs">{`{{ $randomInt }}`}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Mock 表达式 @*</DropdownMenuLabel>
        {MOCK_SNIPPETS.map((s) => (
          <DropdownMenuItem key={s.value} onClick={() => insert(s.value)}>
            {s.label}
            <span className="ml-auto font-mono text-[10px] text-muted-foreground">{s.value}</span>
          </DropdownMenuItem>
        ))}
        {(caseRefs.length > 0 || caseKey) && <DropdownMenuSeparator />}
        {caseRefs.length > 0 ? (
          <>
            <DropdownMenuLabel>用例链式引用 $.key.*</DropdownMenuLabel>
            {caseRefs.map((c) => (
              <DropdownMenuItem key={c.key} onClick={() => insert(`$.${c.key}.body.`)}>
                <span className="font-mono text-xs">$.{c.key}.body.</span>
                <span className="ml-1 text-muted-foreground">{c.label}</span>
              </DropdownMenuItem>
            ))}
          </>
        ) : null}
        {caseKey ? (
          <DropdownMenuItem onClick={() => insert(`$.${caseKey}.body.`)}>
            引用本用例 body
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
