"use client";

/**
 * Mock / 变量表达式快捷插入（兼容旧用法，内部使用 VariablePicker）
 */
import type { ProjectEnvItem } from "../../lib/api/types";
import { VariablePicker, type VariablePickerCaseRef } from "./variable-picker";

interface MockExpressionPickerProps {
  /** 点击片段时回调，由父组件写入当前输入框 */
  onInsert: (text: string) => void;
  caseKey?: number;
  envs?: ProjectEnvItem[];
  envIndex?: number;
  caseRefs?: VariablePickerCaseRef[];
}

export function MockExpressionPicker({
  onInsert,
  caseKey,
  envs,
  envIndex,
  caseRefs,
}: MockExpressionPickerProps) {
  return (
    <VariablePicker
      onInsert={onInsert}
      caseKey={caseKey}
      envs={envs}
      envIndex={envIndex}
      caseRefs={caseRefs}
      triggerLabel="插入 Mock / 变量"
    />
  );
}
