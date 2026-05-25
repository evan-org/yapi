/**
 * 在内存中应用 Mongoose update 文档（含 $set / $push / $pull）
 */
import type { DocRecord } from "./document.js";

function setByPath(doc: DocRecord, path: string, value: unknown) {
  const parts = path.split(".");
  let cur: DocRecord = doc;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (cur[p] == null || typeof cur[p] !== "object") {
      cur[p] = {};
    }
    cur = cur[p] as DocRecord;
  }
  cur[parts[parts.length - 1]] = value;
}

function getByPath(doc: DocRecord, path: string): unknown {
  const parts = path.split(".");
  let cur: unknown = doc;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") {
      return undefined;
    }
    cur = (cur as DocRecord)[p];
  }
  return cur;
}

function applyPositionalMember(doc: DocRecord, filter: DocRecord, sets: Record<string, unknown>) {
  const uid = filter["members.uid"];
  const members = doc.members;
  if (!Array.isArray(members) || uid == null) {
    return;
  }
  const idx = members.findIndex((m) => m && (m as DocRecord).uid == uid);
  if (idx < 0) {
    return;
  }
  for (const [key, val] of Object.entries(sets)) {
    if (key.startsWith("members.$.")) {
      const field = key.slice("members.$.".length);
      (members[idx] as DocRecord)[field] = val;
    }
  }
}

/** 将 update 应用到 doc 副本 */
export function applyUpdate(
  doc: DocRecord,
  update: DocRecord,
  filter?: DocRecord
): DocRecord {
  const next = { ...doc };
  const hasOperator = Object.keys(update).some((k) => k.startsWith("$"));

  if (!hasOperator) {
    Object.assign(next, update);
    return next;
  }

  if (update.$set && typeof update.$set === "object") {
    const sets = update.$set as DocRecord;
    const hasPositional = Object.keys(sets).some((k) => k.includes("members.$."));
    if (hasPositional && filter) {
      applyPositionalMember(next, filter, sets);
    }
    for (const [key, val] of Object.entries(sets)) {
      if (!key.includes("members.$.")) {
        setByPath(next, key, val);
      }
    }
  }

  if (update.$push && typeof update.$push === "object") {
    for (const [key, val] of Object.entries(update.$push as DocRecord)) {
      const arr = (getByPath(next, key) as unknown[]) || [];
      if (val && typeof val === "object" && Array.isArray((val as DocRecord).$each)) {
        arr.push(...((val as DocRecord).$each as unknown[]));
      } else {
        arr.push(val);
      }
      setByPath(next, key, arr);
    }
  }

  if (update.$pull && typeof update.$pull === "object") {
    for (const [key, val] of Object.entries(update.$pull as DocRecord)) {
      let arr = (getByPath(next, key) as unknown[]) || [];
      if (val && typeof val === "object") {
        const cond = val as DocRecord;
        arr = arr.filter((item) => {
          if (!item || typeof item !== "object") {
            return true;
          }
          for (const [ck, cv] of Object.entries(cond)) {
            if ((item as DocRecord)[ck] != cv) {
              return true;
            }
          }
          return false;
        });
      } else {
        arr = arr.filter((item) => item !== val);
      }
      setByPath(next, key, arr);
    }
  }

  if (update.$inc && typeof update.$inc === "object") {
    for (const [key, val] of Object.entries(update.$inc as DocRecord)) {
      const cur = Number(getByPath(next, key) || 0);
      setByPath(next, key, cur + Number(val));
    }
  }

  return next;
}
