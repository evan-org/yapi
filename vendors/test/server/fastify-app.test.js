import test from "ava";
import path from "path";
import fs from "fs";
import { MongoMemoryServer } from "mongodb-memory-server";

const serverDir = path.join(__dirname, "../../server");
const configPath = path.join(__dirname, "../../../config.json");

let mongod;

test.before(async () => {
  process.env.YAPI_ENV = "test";
  mongod = await MongoMemoryServer.create();
  const baseUri = mongod.getUri().replace(/\/?$/, "");
  const uri = `${baseUri}/yapi_test`;

  const config = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../../config_example.json"), "utf8")
  );
  config.port = "3001";
  config.db = Object.assign({}, config.db, { connectString: uri });
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  process.env.NODE_PATH = serverDir;
  require("module").Module._initPaths();

  const mongoose = require("mongoose");
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  });

  const autoIncrement = require(path.join(serverDir, "utils/mongoose-auto-increment.js"));
  autoIncrement.initialize(mongoose);

  require(path.join(serverDir, "utils/db.js"));

  const yapi = require(path.join(serverDir, "yapi.js"));
  const commons = require(path.join(serverDir, "utils/commons.js"));
  yapi.commons = commons;
  yapi.connect = Promise.resolve(mongoose);

  require(path.join(serverDir, "plugin.js"));
});

test.after.always(async () => {
  const mongoose = require("mongoose");
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongod) {
    await mongod.stop();
  }
});

test("GET /api/health 返回服务状态", async (t) => {
  const { buildApp } = require(path.join(serverDir, "fastifyApp.js"));
  const app = await buildApp();

  const res = await app.inject({ method: "GET", url: "/api/health" });
  const body = JSON.parse(res.payload);

  t.is(res.statusCode, 200);
  t.is(body.status, "ok");
  t.is(body.framework, "fastify");
  t.truthy(body.version);

  await app.close();
});

test("GET /api/not_exists 返回 404 JSON", async (t) => {
  const { buildApp } = require(path.join(serverDir, "fastifyApp.js"));
  const app = await buildApp();

  const res = await app.inject({ method: "GET", url: "/api/not_exists_route_xyz" });
  const body = JSON.parse(res.payload);

  t.is(res.statusCode, 404);
  t.is(body.errcode, 404);

  await app.close();
});

test("GET /mock/ 无 projectId 时返回业务错误", async (t) => {
  const { buildApp } = require(path.join(serverDir, "fastifyApp.js"));
  const app = await buildApp();

  const res = await app.inject({ method: "GET", url: "/mock//test" });
  const body = JSON.parse(res.payload);

  t.is(res.statusCode, 200);
  t.is(body.errcode, 400);
  t.regex(body.errmsg, /projectId/);

  await app.close();
});

test("GET /api/user/status 可访问（未登录）", async (t) => {
  const { buildApp } = require(path.join(serverDir, "fastifyApp.js"));
  const app = await buildApp();

  const res = await app.inject({ method: "GET", url: "/api/user/status" });
  const body = JSON.parse(res.payload);

  t.is(res.statusCode, 200);
  t.is(body.errcode, 40011);

  await app.close();
});

