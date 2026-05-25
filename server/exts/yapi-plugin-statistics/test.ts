// @ts-nocheck
import fs from 'fs-extra';

import yapi from '../../server/runtime.js';

import commons from '../../server/utils/commons.js';

import dbModule from '../../server/utils/db.js';

import userModel from '../../server/models/user.js';

import { getPool } from "../../db/pg-pool.js";
import { tableName } from "../../db/table.js";

yapi.commons = commons;
yapi.connect = dbModule.connect();

const convert2Decimal = (num) => (num > 9 ? num : `0${num}`);
const formatYMD = (val, joinStr = "-") => {
  let date = val;
  if (typeof val !== "object") {
    val = val * 1000;
    date = new Date(val);
  }
  return `${[
    date.getFullYear(),
    convert2Decimal(date.getMonth() + 1),
    convert2Decimal(date.getDate())
  ].join(joinStr)}`;
};

function run() {
  let time = yapi.commons.time() - 10000000;
  let data = (i) => {
    time = time - yapi.commons.rand(10000, 1000000);
    return {
      interface_id: 94,
      project_id: 25,
      group_id: 19,
      time: time,
      ip: "1.1.1.1",
      date: formatYMD(time)
    };
  };

  yapi.connect
    .then(async function() {
      const pool = getPool();
      const tbl = tableName("statis_mock");
      let batch: ReturnType<typeof data>[] = [];
      for (let i = 0; i < 11; i++) {
        batch.push(data(i));
        if (batch.length >= 5) {
          for (const row of batch) {
            await pool.query(
              `INSERT INTO ${tbl}
                (interface_id, project_id, group_id, time, ip, date)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [
                row.interface_id,
                row.project_id,
                row.group_id,
                row.time,
                row.ip,
                row.date,
              ]
            );
          }
          batch = [];
        }
      }
    })
    .catch(function(err) {
      throw new Error(err.message);
    });
}

run();
