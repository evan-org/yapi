// @ts-nocheck
import yapi from "../runtime.js";
import baseModel from "./base.js";

class logModel extends baseModel {
  getName() {
    return "log";
  }

  save(data) {
    return this.store.insert({
      content: data.content,
      type: data.type,
      uid: data.uid,
      username: data.username,
      typeid: data.typeid,
      add_time: yapi.commons.time(),
      data: data.data,
    });
  }

  del(id) {
    return this.store.delete({ _id: id });
  }

  list(typeid, type) {
    return this.store.findMany({ typeid, type });
  }

  listWithPaging(typeid, type, page, limit, selectValue) {
    page = parseInt(page);
    limit = parseInt(limit);
    const params = { type, typeid };
    if (selectValue === "wiki") {
      params["data.type"] = selectValue;
    }
    if (selectValue && !isNaN(selectValue)) {
      params["data.interface_id"] = +selectValue;
    }
    return this.store.findMany(params, {
      sort: { add_time: -1 },
      skip: (page - 1) * limit,
      limit,
    });
  }

  listWithPagingByGroup(typeid, pidList, page, limit) {
    page = parseInt(page);
    limit = parseInt(limit);
    return this.store.findMany(
      {
        $or: [
          { type: "project", typeid: { $in: pidList } },
          { type: "group", typeid },
        ],
      },
      { sort: { add_time: -1 }, skip: (page - 1) * limit, limit }
    );
  }

  listCountByGroup(typeid, pidList) {
    return this.store.count({
      $or: [
        { type: "project", typeid: { $in: pidList } },
        { type: "group", typeid },
      ],
    });
  }

  listCount(typeid, type, selectValue) {
    const params = { type, typeid };
    if (selectValue === "wiki") {
      params["data.type"] = selectValue;
    }
    if (selectValue && !isNaN(selectValue)) {
      params["data.interface_id"] = +selectValue;
    }
    return this.store.count(params);
  }

  listWithCatid(typeid, type, interfaceId) {
    const params = { type, typeid };
    if (interfaceId && !isNaN(interfaceId)) {
      params["data.interface_id"] = +interfaceId;
    }
    return this.store.findMany(params, {
      sort: { add_time: -1 },
      limit: 1,
      fields: this._fields("uid content type username typeid add_time"),
    });
  }
}

export default logModel;
