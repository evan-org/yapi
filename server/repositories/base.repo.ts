/**
 * 仓储基类：封装 yapi.getInst 单例，统一数据访问入口（懒加载，避免模块循环初始化问题）
 */
import yapi from "../runtime.js";

/** Model 实例（JSONB store 数据访问方法） */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ModelInstance = any;

/**
 * 根据 Model 类创建仓储代理（首次访问时才 getInst）
 * @param ModelClass server/models 下的 Model 类
 */
export function createModelRepository<T extends ModelInstance>(
  ModelClass: new () => T
): T {
  let inst: T | null = null;

  const resolveInst = (): T => {
    if (!inst) {
      inst = yapi.getInst(ModelClass) as T;
    }
    return inst;
  };

  return new Proxy({} as object, {
    get(_target, prop) {
      const target = resolveInst();
      const val = (target as Record<string | symbol, unknown>)[prop as string];
      if (typeof val === "function") {
        return val.bind(target);
      }
      return val;
    },
  }) as T;
}
