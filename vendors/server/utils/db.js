const Mongoose = require("mongoose");
const yapi = require("../yapi.js");
const autoIncrement = require("./mongoose-auto-increment");
function model(model, schema) {
  if (!(schema instanceof Mongoose.Schema)) {
    schema = new Mongoose.Schema(schema);
  }
  schema.set("autoIndex", false);
  return Mongoose.model(model, schema, model);
}
function connect(callback) {
  Mongoose.Promise = global.Promise;
  Mongoose.set("useNewUrlParser", true);
  Mongoose.set("useFindAndModify", false);
  Mongoose.set("useCreateIndex", true);
  //
  const config = yapi.WEBROOT_CONFIG;
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
  let connectString = "";
  if (config.db.connectString) {
    connectString = config.db.connectString;
  } else {
    connectString = `mongodb://${config.db.servername}:${config.db.port}/${config.db.DATABASE}`;
    if (config.db.authSource) {
      connectString = connectString + `?authSource=${config.db.authSource}`;
    }
  }
  //
  const db = Mongoose.connect(connectString, options, (err) => {
    if (err) {
      yapi.commons.log(err + ", mongodb Authentication failed", "error");
    }
  });
  //
  db.then(() => {
    yapi.commons.log("mongodb load success...");
    if (typeof callback === "function") {
      callback.call(db);
    }
  }, (err) => {
    yapi.commons.log(err + "mongodb connect error", "error");
  });
  //
  autoIncrement.initialize(db);
  return db;
}
//
yapi.db = model;
//
module.exports = {
  model: model,
  connect: connect
};
