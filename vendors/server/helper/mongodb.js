const yapi = require("@server/yapi.js");
const mongoose = require("mongoose");
//
const autoIncrement = require("./mongooseAutoIncrement.js");
const config = yapi.WEBROOT_CONFIG;
//
mongoose.set("strictQuery", true);
//
function useModel(model, schema) {
  if (!(schema instanceof mongoose.Schema)) {
    schema = new mongoose.Schema(schema);
  }
  schema.set("autoIndex", false);
  return mongoose.model(model, schema, model);
}
//
function useCreate() {
  //
  const options = Object.assign({}, { useNewUrlParser: true, useUnifiedTopology: true }, config.db.options);
  //
  if (config.db.user) {
    options.user = config.db.user;
    options.pass = config.db.pass;
  }
  if (config.db.reconnectTries) {
    options.reconnectTries = config.db.reconnectTries;
  }
  if (config.db.reconnectInterval) {
    options.reconnectInterval = config.db.reconnectInterval;
  }
  // 生成连接地址
  if (config.db.connectString) {
    const connectString = config.db.connectString;
    return { connectString, options }
  }
  let connectString = `mongodb://${config.db.user}:${config.db.pass}@${config.db.servername}:${config.db.port}/${config.db.DATABASE}`;
  // let connectString = `mongodb://${config.db.servername}:${config.db.port}/${config.db.DATABASE}`;
  if (config.db.authSource) {
    connectString = connectString + `?authSource=${config.db.authSource}`;
  }
  return { connectString, options }
}
/**
 * @returns Promise
 * */
function useConnect() {
  try {
    const { connectString, options } = useCreate();
    console.log(connectString, "\n", JSON.stringify(options));
    // 链接 MongoDB
    const db = mongoose.connect(connectString, options);
    console.log("Database connected successfully");
    yapi.commons.log("mongodb load success...");
    // 监听连接成功事件
    mongoose.connection.on("connected", (connected) => {
      console.log("MongoDB connection connected");
    });
    // 监听连接失败事件
    mongoose.connection.on("error", (err) => {
      console.log("MongoDB connection error: ");
    });
    // 监听连接断开事件
    mongoose.connection.on("disconnected", (disconnected) => {
      console.log("MongoDB connection disconnected");
    });
    // 用于创建自增ID。该插件会在数据库中创建一个名为IdentityCounter的集合，用于存储各个模型的自增ID计数器。
    autoIncrement.initialize(db);
    return db
  } catch (e) {
    throw new Error(e);
  }
}
//
yapi.db = useModel;
//
module.exports = {
  model: useModel,
  connect: useConnect
};
