const fs = require("fs");
const os = require("os");
const path = require("path");
const { pipeline } = require("stream/promises");

/**
 * 将 multipart 请求解析为与 koa-body 兼容的结构
 */
async function parseMultipartBody(request) {
  if (!request.isMultipart()) {
    return;
  }

  const fields = {};
  const files = {};

  for await (const part of request.parts()) {
    if (part.file) {
      const tmpPath = path.join(
        os.tmpdir(),
        `yapi-${Date.now()}-${Math.random().toString(36).slice(2)}-${part.filename || "file"}`
      );
      await pipeline(part.file, fs.createWriteStream(tmpPath));
      files[part.fieldname] = {
        path: tmpPath,
        name: part.filename,
        type: part.mimetype,
        size: part.file.bytesRead
      };
    } else {
      fields[part.fieldname] = part.value;
    }
  }

  request._yapiBody = Object.assign({}, fields, { fields, files });
}

module.exports = { parseMultipartBody };
