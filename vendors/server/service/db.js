const Mongoose = require("mongoose");
const yapi = require("../yapi.js");
const autoIncrement = require("./mongooseAutoIncrement.js");
const config = yapi.WEBROOT_CONFIG;
//
function model(model, schema) {
  if (!(schema instanceof Mongoose.Schema)) {
    schema = new Mongoose.Schema(schema);
  }
  schema.set("autoIndex", false);
  return Mongoose.model(model, schema, model);
}
//
function useCreate() {
  //
  const options = Object.assign({}, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }, config.db.options);
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
  let connectString = `mongodb://${config.db.servername}:${config.db.port}/${config.db.DATABASE}`;
  if (config.db.authSource) {
    connectString = connectString + `?authSource=${config.db.authSource}`;
  }
  return { connectString, options }
}
//
function connect(callback) {
  return new Promise((resolve, reject) => {
    //
    const {connectString, options} = useCreate();
    //
    Mongoose.set("useNewUrlParser", true);
    Mongoose.set("useFindAndModify", false);
    Mongoose.set("useCreateIndex", true);
    // 链接 MongoDB
    Mongoose.connect(connectString, options).then((db) => {
      console.log("Database connected successfully");
      yapi.commons.log("mongodb load success...");
      // 用于创建自增ID。该插件会在数据库中创建一个名为IdentityCounter的集合，用于存储各个模型的自增ID计数器。
      autoIncrement.initialize(db);
      resolve(db)
    }).catch((err) => {
      console.error(err);
      reject(err)
    });
    // 监听连接成功事件
    Mongoose.connection.on("connected", (connected) => {
      console.log("MongoDB connected", connected);
    });
    // 监听连接失败事件
    Mongoose.connection.on("error", (err) => {
      console.log("MongoDB connection error: " + err);
    });
    // 监听连接断开事件
    Mongoose.connection.on("disconnected", (disconnected) => {
      console.log("MongoDB disconnected");
    });
  })
}
//
yapi.db = model;
//
module.exports = {
  model: model,
  connect: connect
};
