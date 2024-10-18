/**
 * Created by gxl.gao on 2017/10/24.
 */
const yapi = require("@/yapi.js");
//
const BaseModel = require("@/models/BaseModel.js");
const mongoose = require("mongoose");
//
class StatisticsMockModel extends BaseModel {
  constructor() {
    super();
    let Col = mongoose.connection.db.collection("statis_mock");
    Col.createIndex({
      interface_id: 1
    });
    Col.createIndex({
      project_id: 1
    });
    Col.createIndex({
      group_id: 1
    });
    Col.createIndex({
      time: 1
    });
    Col.createIndex({
      date: 1
    });
  }
  getName() {
    return "statis_mock";
  }
  getSchema() {
    return {
      interface_id: { type: Number, required: true },
      project_id: { type: Number, required: true },
      group_id: { type: Number, required: true },
      time: Number, // '时间戳'
      ip: String,
      date: String
    };
  }
  countByGroupId(id) {
    return this.UseModel.countDocuments({ group_id: id })
  }
  save(data) {
    const m = new this.UseModel(data);
    return m.save();
  }
  getTotalCount() {
    return this.UseModel.countDocuments({});
  }
  async getDayCount(timeInterval) {
    let end = timeInterval[1];
    let start = timeInterval[0];
    let data = [];
    console.log("getDayCount", timeInterval, this.UseModel);
    const cursor = this.UseModel.aggregate([
      {
        $match: {
          date: { $gt: start, $lte: end }
        }
      },
      {
        $group: {
          _id: "$date",  // $region is the column name in collection
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]).exec();
    console.log(cursor);
    // await cursor.eachAsync((doc) => data.push(doc));
    return data;
  }
  list() {
    return this.UseModel.find({}).select("date").exec();
  }
  up(id, data) {
    data.up_time = yapi.commons.time();
    return this.UseModel.updateOne({ _id: id }, data, { runValidators: true });
  }
}
module.exports = StatisticsMockModel;
