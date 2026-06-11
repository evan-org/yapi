// @ts-nocheck
/**
 * 将 YApi 分类+接口列表转换为 OpenAPI 2.0 (Swagger) 文档
 */

/** 构建 Swagger 2.0 模型对象 */
export function buildSwaggerV2Model(curProject: Record<string, unknown>, list: unknown[]) {
  return {
    swagger: "2.0",
    info: {
      title: curProject.name,
      version: "last",
      description: curProject.desc,
    },
    basePath: curProject.basepath ? curProject.basepath : "/",
    tags: (() => {
      const tagArray = [];
      list.forEach((t) => {
        tagArray.push({
          name: t.name,
          description: t.desc,
        });
      });
      return tagArray;
    })(),
    schemes: ["http"],
    paths: (() => {
      const apisObj = {};
      for (const aptTag of list) {
        for (const api of aptTag.list) {
          if (apisObj[api.path] == null) {
            apisObj[api.path] = {};
          }
          apisObj[api.path][api.method.toLowerCase()] = (() => {
            const apiItem = {};
            apiItem["tags"] = [aptTag.name];
            apiItem["summary"] = api.title;
            apiItem["description"] = api.markdown;
            switch (api.req_body_type) {
              case "form":
              case "file":
                apiItem["consumes"] = ["multipart/form-data"];
                break;
              case "json":
                apiItem["consumes"] = ["application/json"];
                break;
              case "raw":
                apiItem["consumes"] = ["text/plain"];
                break;
              default:
                break;
            }
            apiItem["parameters"] = (() => {
              const paramArray = [];
              for (const p of api.req_headers) {
                if (p.name === "Content-Type") {
                  continue;
                }
                paramArray.push({
                  name: p.name,
                  in: "header",
                  description: `${p.name} (Only:${p.value})`,
                  required: Number(p.required) === 1,
                  type: "string",
                  default: p.value,
                });
              }
              for (const p of api.req_params) {
                paramArray.push({
                  name: p.name,
                  in: "path",
                  description: p.desc,
                  required: true,
                  type: "string",
                });
              }
              for (const p of api.req_query) {
                paramArray.push({
                  name: p.name,
                  in: "query",
                  required: Number(p.required) === 1,
                  description: p.desc,
                  type: "string",
                });
              }
              switch (api.req_body_type) {
                case "form": {
                  for (const p of api.req_body_form) {
                    paramArray.push({
                      name: p.name,
                      in: "formData",
                      required: Number(p.required) === 1,
                      description: p.desc,
                      type: p.type === "text" ? "string" : "file",
                    });
                  }
                  break;
                }
                case "json": {
                  if (api.req_body_other) {
                    const jsonParam = JSON.parse(api.req_body_other);
                    if (jsonParam) {
                      paramArray.push({
                        name: "root",
                        in: "body",
                        description: jsonParam.description,
                        schema: jsonParam,
                      });
                    }
                  }
                  break;
                }
                case "file": {
                  paramArray.push({
                    name: "upfile",
                    in: "formData",
                    description: api.req_body_other,
                    type: "file",
                  });
                  break;
                }
                case "raw": {
                  paramArray.push({
                    name: "raw",
                    in: "body",
                    description: "raw paramter",
                    schema: {
                      type: "string",
                      format: "binary",
                      default: api.req_body_other,
                    },
                  });
                  break;
                }
                default:
                  break;
              }
              return paramArray;
            })();
            apiItem["responses"] = {
              "200": {
                description: "successful operation",
                schema: (() => {
                  let schemaObj = {};
                  if (api.res_body_type === "raw") {
                    schemaObj["type"] = "string";
                    schemaObj["format"] = "binary";
                    schemaObj["default"] = api.res_body;
                  } else if (api.res_body_type === "json") {
                    if (api.res_body) {
                      const resBody = JSON.parse(api.res_body);
                      if (resBody !== null) {
                        schemaObj = resBody;
                      }
                    }
                  }
                  return schemaObj;
                })(),
              },
            };
            return apiItem;
          })();
        }
      }
      return apisObj;
    })(),
  };
}
