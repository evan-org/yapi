/**
 * Ant Design Upload 与 apiClient 对接辅助
 */
import { message } from "antd";
import { isApiOk } from "./apiHelpers";

/**
 * 将 File 转为 base64 字符串
 * @param {File} file
 * @returns {Promise<string>}
 */
export function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * 生成 Upload customRequest：读取文件后调用上传 API
 * @param {(payload: *) => Promise<import('axios').AxiosResponse>} uploadFn
 * @param {(base64: string) => *} [onSuccess] 上传成功回调
 */
export function createBase64UploadRequest(uploadFn, onSuccess) {
  return async ({ file, onSuccess: onAntSuccess, onError }) => {
    try {
      const base64 = await readFileAsBase64(file);
      const res = await uploadFn(base64);
      if (!isApiOk(res)) {
        const err = new Error((res.data && res.data.errmsg) || "上传失败");
        message.error(err.message);
        onError(err);
        return;
      }
      if (onSuccess) {
        onSuccess(base64, res);
      }
      onAntSuccess(res.data, file);
    } catch (err) {
      console.error("upload failed", err);
      message.error(err.message || "上传失败");
      onError(err);
    }
  };
}
