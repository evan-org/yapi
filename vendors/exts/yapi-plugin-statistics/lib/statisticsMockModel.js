/**
 * Created by gxl.gao on 2017/10/24.
 */
const yapi = require("@server/yapi.js");
const BaseModel = require("@server/models/base.js");
class StatisticsMockModel extends BaseModel {
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
    return this.model.countDocuments({
      group_id: id
    })
  }
  save(data) {
    let m = new this.model(data);
    return m.save();
  }
  getTotalCount() {
    return this.model.countDocuments({});
  }
  async getDayCount(timeInterval) {
    let end = timeInterval[1];
    let start = timeInterval[0];
    let data = [];
    console.log('getDayCount', timeInterval, this.model);
    const cursor = this.model.aggregate([
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
    return this.model.find({}).select("date").exec();
  }
  up(id, data) {
    data.up_time = yapi.commons.time();
    return this.model.updateOne({
      _id: id
    }, data, { runValidators: true });
  }
}
module.exports = StatisticsMockModel;
