/**
 * 接口模块请求参数校验 schema（供 Controller / Service 共用）
 */

const minLengthStringField = {
  type: "string",
  minLength: 1,
};

const addAndUpCommonField = {
  desc: "string",
  status: "string",
  req_query: [
    {
      name: "string",
      value: "string",
      example: "string",
      desc: "string",
      required: "string",
    },
  ],
  req_headers: [
    {
      name: "string",
      value: "string",
      example: "string",
      desc: "string",
      required: "string",
    },
  ],
  req_body_type: "string",
  req_params: [
    {
      name: "string",
      example: "string",
      desc: "string",
    },
  ],
  req_body_form: [
    {
      name: "string",
      type: {
        type: "string",
      },
      example: "string",
      desc: "string",
      required: "string",
    },
  ],
  req_body_other: "string",
  res_body_type: "string",
  res_body: "string",
  custom_field_value: "string",
  api_opened: "boolean",
  req_body_is_json_schema: "boolean",
  res_body_is_json_schema: "boolean",
  markdown: "string",
  tag: "array",
};

export type InterfaceSchemaMap = {
  add: Record<string, unknown>;
  up: Record<string, unknown>;
  save: Record<string, unknown>;
};

/**
 * 构建 interface add / up / save 校验 schema 表
 */
export function buildInterfaceSchemaMap(): InterfaceSchemaMap {
  return {
    add: Object.assign(
      {
        "*project_id": "number",
        "*path": minLengthStringField,
        "*title": minLengthStringField,
        "*method": minLengthStringField,
        "*catid": "number",
      },
      addAndUpCommonField
    ),
    up: Object.assign(
      {
        "*id": "number",
        project_id: "number",
        path: minLengthStringField,
        title: minLengthStringField,
        method: minLengthStringField,
        catid: "number",
        switch_notice: "boolean",
        message: minLengthStringField,
      },
      addAndUpCommonField
    ),
    save: Object.assign(
      {
        "*project_id": "number",
        catid: "number",
        title: minLengthStringField,
        path: minLengthStringField,
        method: minLengthStringField,
        message: minLengthStringField,
        switch_notice: "boolean",
        dataSync: "string",
      },
      addAndUpCommonField
    ),
  };
}

/** 单例 schema 表，避免每次请求重复构建 */
export const interfaceSchemaMap = buildInterfaceSchemaMap();
