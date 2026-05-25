// @ts-nocheck
/**
 * PostgreSQL 连通性冒烟（仅在 CI 环境执行，本地无 PG 时跳过）
 */
import test from "ava";
import pg from "pg";
import { shouldRunPgCi, pgUri, disconnectPg } from "../helpers/pg-ci.js";

test("PostgreSQL 服务可连接", async (t) => {
  if (!shouldRunPgCi()) {
    t.pass();
    return;
  }
  const client = new pg.Client({ connectionString: pgUri() });
  await client.connect();
  try {
    const res = await client.query("SELECT 1 AS ok");
    t.is(res.rows[0].ok, 1);
  } finally {
    await client.end();
    await disconnectPg();
  }
});

test("PostgreSQL JSONB 表可写入并查询", async (t) => {
  if (!shouldRunPgCi()) {
    t.pass();
    return;
  }
  const client = new pg.Client({ connectionString: pgUri() });
  await client.connect();
  const tbl = `yapi_ci_smoke_${Date.now()}`;
  try {
    await client.query(
      `CREATE TABLE ${tbl} (_id SERIAL PRIMARY KEY, doc JSONB NOT NULL DEFAULT '{}')`
    );
    const marker = `yapi-ci-${Date.now()}`;
    await client.query(`INSERT INTO ${tbl} (doc) VALUES ($1::jsonb)`, [
      JSON.stringify({ marker, ts: Date.now() }),
    ]);
    const res = await client.query(
      `SELECT doc->>'marker' AS marker FROM ${tbl} WHERE doc->>'marker' = $1`,
      [marker]
    );
    t.is(res.rows.length, 1);
    t.is(res.rows[0].marker, marker);
    await client.query(`DROP TABLE ${tbl}`);
  } finally {
    await client.end();
    await disconnectPg();
  }
});
