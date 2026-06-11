/**
 * JSON Schema 与可视化表格行互转（对齐 YApi schema 树结构）
 */

/** 可视化编辑行 */
export interface SchemaVisualRow {
  /** 前端行唯一 id */
  id: string;
  name: string;
  type: string;
  required: boolean;
  description: string;
  defaultValue: string;
  mock: string;
  /** object 类型的子字段 */
  children?: SchemaVisualRow[];
}

const SCHEMA_TYPES = ["string", "number", "integer", "boolean", "object", "array"] as const;

let rowIdSeq = 0;

/** 生成行 id */
export function nextSchemaRowId(): string {
  rowIdSeq += 1;
  return `schema-row-${rowIdSeq}`;
}

/** 支持的 Schema 类型列表 */
export function getSchemaTypeOptions(): string[] {
  return [...SCHEMA_TYPES];
}

/**
 * 将 JSON Schema 文本解析为可视化行（仅处理根 object）
 */
export function parseSchemaTextToRows(text: string): SchemaVisualRow[] {
  let schema: Record<string, unknown>;
  try {
    schema = JSON.parse(text || "{}") as Record<string, unknown>;
  } catch (err) {
    console.error("JSON Schema 解析失败", err);
    return [];
  }
  if (!schema || typeof schema !== "object") {
    return [];
  }
  if (schema.type !== "object" && !schema.properties) {
    schema = { type: "object", properties: schema.properties || {} };
  }
  return parseObjectProperties(
    (schema.properties as Record<string, Record<string, unknown>>) || {},
    (schema.required as string[]) || []
  );
}

function parseObjectProperties(
  properties: Record<string, Record<string, unknown>>,
  required: string[]
): SchemaVisualRow[] {
  return Object.keys(properties).map((name) => {
    const prop = properties[name] || {};
    const type = String(prop.type || "string");
    const row: SchemaVisualRow = {
      id: nextSchemaRowId(),
      name,
      type,
      required: required.includes(name),
      description: String(prop.description || prop.title || ""),
      defaultValue: prop.default !== undefined ? String(prop.default) : "",
      mock: extractMock(prop),
    };
    if (type === "object" && prop.properties) {
      row.children = parseObjectProperties(
        prop.properties as Record<string, Record<string, unknown>>,
        (prop.required as string[]) || []
      );
    } else if (type === "array" && prop.items) {
      const items = prop.items as Record<string, unknown>;
      const itemType = String(items.type || "string");
      if (itemType === "object" && items.properties) {
        row.children = parseObjectProperties(
          items.properties as Record<string, Record<string, unknown>>,
          (items.required as string[]) || []
        );
      }
    }
    return row;
  });
}

function extractMock(prop: Record<string, unknown>): string {
  const mock = prop.mock as { mock?: string } | string | undefined;
  if (typeof mock === "string") {
    return mock;
  }
  if (mock && typeof mock === "object" && mock.mock) {
    return String(mock.mock);
  }
  return "";
}

/**
 * 将可视化行序列化为 JSON Schema 文本
 */
export function rowsToSchemaText(rows: SchemaVisualRow[]): string {
  const properties: Record<string, Record<string, unknown>> = {};
  const required: string[] = [];
  rows.forEach((row) => {
    if (!row.name.trim()) {
      return;
    }
    properties[row.name.trim()] = rowToProperty(row);
    if (row.required) {
      required.push(row.name.trim());
    }
  });
  const schema: Record<string, unknown> = {
    type: "object",
    properties,
  };
  if (required.length > 0) {
    schema.required = required;
  }
  return JSON.stringify(schema, null, 2);
}

function rowToProperty(row: SchemaVisualRow): Record<string, unknown> {
  const prop: Record<string, unknown> = {
    type: row.type || "string",
  };
  if (row.description) {
    prop.description = row.description;
  }
  if (row.defaultValue !== "") {
    const num = Number(row.defaultValue);
    if (row.type === "number" || row.type === "integer") {
      prop.default = Number.isNaN(num) ? row.defaultValue : num;
    } else if (row.type === "boolean") {
      prop.default = row.defaultValue === "true";
    } else {
      prop.default = row.defaultValue;
    }
  }
  if (row.mock) {
    prop.mock = { mock: row.mock };
  }
  if (row.type === "object" && row.children && row.children.length > 0) {
    const childProps: Record<string, Record<string, unknown>> = {};
    const childRequired: string[] = [];
    row.children.forEach((child) => {
      if (!child.name.trim()) {
        return;
      }
      childProps[child.name.trim()] = rowToProperty(child);
      if (child.required) {
        childRequired.push(child.name.trim());
      }
    });
    prop.properties = childProps;
    if (childRequired.length > 0) {
      prop.required = childRequired;
    }
  }
  if (row.type === "array") {
    if (row.children && row.children.length > 0) {
      const first = row.children[0];
      prop.items = rowToProperty({ ...first, type: first.type || "string" });
    } else {
      prop.items = { type: "string" };
    }
  }
  return prop;
}

/** 创建空行 */
export function createEmptySchemaRow(): SchemaVisualRow {
  return {
    id: nextSchemaRowId(),
    name: "",
    type: "string",
    required: false,
    description: "",
    defaultValue: "",
    mock: "",
  };
}
