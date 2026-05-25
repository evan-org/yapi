"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createModelRepository = createModelRepository;
/**
 * 仓储基类：封装 yapi.getInst 单例，统一数据访问入口（懒加载，避免模块循环初始化问题）
 */
const yapi = require("../yapi.js");
/**
 * 根据 Model 类创建仓储代理（首次访问时才 getInst）
 * @param ModelClass server/models 下的 Model 类
 */
function createModelRepository(ModelClass) {
    let inst = null;
    const resolveInst = () => {
        if (!inst) {
            inst = yapi.getInst(ModelClass);
        }
        return inst;
    };
    return new Proxy({}, {
        get(_target, prop) {
            const target = resolveInst();
            const val = target[prop];
            if (typeof val === "function") {
                return val.bind(target);
            }
            return val;
        },
    });
}
