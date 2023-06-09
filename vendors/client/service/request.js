import service from "./service";
/**
 * 请求
 * @author winixi@qq.com
 */
const request = {
  request: service.request,
  /**
   * get
   * @param {string}apiUri
   * @param {object}params
   * @returns {Promise<any>}
   */
  get(apiUri, params) {
    return service({
      method: "GET",
      url: apiUri,
      params: params
    })
  },
  /**
   * post
   * @param apiUri
   * @param data
   */
  post(apiUri, data) {
    return service({
      url: apiUri,
      method: "POST",
      data: data
    })
  },
  /**
   * 上传文件
   * /fileupftp/fileteuploadfor
   *
   * @param {object} file
   * @returns {Promise<unknown>}
   */
  async upload(file) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await service({
        url: "/fileupftp/fileteuploadfor",
        method: "POST",
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 1000 * 60 * 5,
        data: formData
      });
      if (Array.isArray(result.data.guid) && result.data.guid.length > 0) {
        return result.data.guid[0];
      }
      return Promise.reject(result);
    } catch (e) {
      console.error(e);
      return Promise.reject(e);
    }
  }
}
export default request;
