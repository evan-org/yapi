const path = require("path");
const fs = require("fs");
//
// directory to check if exists
const dir = "../../../data/sqlite3";
//
const DB_QUERY_PATH = `${dir}/SQLITE3_DB.db`;
const DB_PATH = path.resolve(__dirname, DB_QUERY_PATH);
function initialize() {
  // check if directory exists
  if (fs.existsSync(dir)) {
    console.log("Directory exists!");
  } else {
    console.log("Directory not found.");
    fs.mkdirSync(path.join(__dirname, dir));
  }
  // 创建数据库连接
  const db = require("better-sqlite3")(DB_PATH, { debug: true });
  db.pragma("journal_mode = WAL");
  // 查询表是否存在的 SQL 语句
  const tableExistsQuery = `
    SELECT name FROM sqlite_master
    WHERE type='table' AND name='users'
  `;
  // 执行查询
  const result = db.prepare(tableExistsQuery).get();
  // 判断结果
  const tableExists = !!result; // 如果结果存在，则表存在；否则表不存在
  if (!tableExists) {
    // 创建默认表
    db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    remark TEXT,
    create_time TEXT
    is_del BOOLEAN
  )
`);
  }
  console.log(tableExists);
  //
  return db;
}
initialize()
//
module.exports.initialize = initialize;
//
// const row = db.prepare("SELECT * FROM users WHERE id = ?").get("");
// //
// console.log(row);
