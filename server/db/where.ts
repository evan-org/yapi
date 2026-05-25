/**
 * 将业务查询条件转为 PostgreSQL WHERE（JSONB doc + _id）
 */
export type DocRecord = Record<string, unknown>;

export type SqlParts = {
  where: string;
  params: unknown[];
};

type JsonField =
  | { kind: "column"; sql: string }
  | { kind: "text"; sql: string }
  | { kind: "array"; arrKey: string; field: string };

function jsonPathKey(key: string): JsonField {
  if (key === "_id") {
    return { kind: "column", sql: "_id" };
  }
  if (key.includes(".")) {
    const parts = key.split(".");
    if (parts.length === 2 && parts[0] === "members") {
      return { kind: "array", arrKey: parts[0], field: parts[1] };
    }
    if (parts.length === 2) {
      const a = parts[0].replace(/'/g, "''");
      const b = parts[1].replace(/'/g, "''");
      return { kind: "text", sql: `doc->'${a}'->>'${b}'` };
    }
    return { kind: "text", sql: `doc#>>'{${parts.join(",")}}'` };
  }
  return { kind: "text", sql: `doc->>'${key.replace(/'/g, "''")}'` };
}

function fieldExpr(field: JsonField): string {
  if (field.kind === "column") {
    return field.sql;
  }
  if (field.kind === "array") {
    const f = field.field.replace(/'/g, "''");
    return `(elem->>'${f}')`;
  }
  return field.sql;
}

function arrayExistsClause(field: JsonField & { kind: "array" }, inner: string): string {
  const arr = field.arrKey.replace(/'/g, "''");
  return `EXISTS (SELECT 1 FROM jsonb_array_elements(doc->'${arr}') AS elem WHERE ${inner})`;
}

function asArrayField(field: JsonField): JsonField & { kind: "array" } | null {
  return field.kind === "array" ? field : null;
}

function matchValue(field: JsonField, value: unknown, params: unknown[]): string | null {
  if (value instanceof RegExp) {
    const arrField = asArrayField(field);
    if (arrField) {
      params.push(value.source);
      return arrayExistsClause(arrField, `${fieldExpr(field)} ~* $${params.length}`);
    }
    params.push(value.source);
    return `${fieldExpr(field)} ~* $${params.length}`;
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const op = value as Record<string, unknown>;
    if (op.$gt !== undefined) {
      params.push(String(op.$gt));
      return `${fieldExpr(field)} > $${params.length}`;
    }
    if (op.$gte !== undefined) {
      params.push(String(op.$gte));
      return `${fieldExpr(field)} >= $${params.length}`;
    }
    if (op.$lt !== undefined) {
      params.push(String(op.$lt));
      return `${fieldExpr(field)} < $${params.length}`;
    }
    if (op.$lte !== undefined) {
      params.push(String(op.$lte));
      return `${fieldExpr(field)} <= $${params.length}`;
    }
    if (op.$in !== undefined && Array.isArray(op.$in)) {
      const placeholders: string[] = [];
      for (const item of op.$in) {
        params.push(item);
        placeholders.push(`$${params.length}`);
      }
      const inList = placeholders.join(", ");
      const arrField = asArrayField(field);
      if (arrField) {
        return arrayExistsClause(arrField, `${fieldExpr(field)} IN (${inList})`);
      }
      return `${fieldExpr(field)} IN (${inList})`;
    }
    if (op.$ne !== undefined) {
      params.push(String(op.$ne));
      return `${fieldExpr(field)} <> $${params.length}`;
    }
    return null;
  }
  params.push(value);
  if (field.kind === "column") {
    return `_id = $${params.length}`;
  }
  const arrField = asArrayField(field);
  if (arrField) {
    return arrayExistsClause(arrField, `${fieldExpr(field)} = $${params.length}`);
  }
  return `${fieldExpr(field)} = $${params.length}`;
}

function buildClause(filter: DocRecord, params: unknown[]): string[] {
  const clauses: string[] = [];
  for (const key of Object.keys(filter)) {
    const value = filter[key];
    if (key === "$or" && Array.isArray(value)) {
      const orParts: string[] = [];
      for (const sub of value) {
        const subClauses = buildClause(sub as DocRecord, params);
        if (subClauses.length) {
          orParts.push(`(${subClauses.join(" AND ")})`);
        }
      }
      if (orParts.length) {
        clauses.push(`(${orParts.join(" OR ")})`);
      }
      continue;
    }
    if (key === "$and" && Array.isArray(value)) {
      for (const sub of value) {
        clauses.push(...buildClause(sub as DocRecord, params));
      }
      continue;
    }
    const field = jsonPathKey(key);
    const part = matchValue(field, value, params);
    if (part) {
      clauses.push(part);
    }
  }
  return clauses;
}

export function buildWhere(filter: DocRecord | null | undefined): SqlParts {
  if (!filter || Object.keys(filter).length === 0) {
    return { where: "TRUE", params: [] };
  }
  const params: unknown[] = [];
  const clauses = buildClause(filter, params);
  return {
    where: clauses.length ? clauses.join(" AND ") : "TRUE",
    params,
  };
}
