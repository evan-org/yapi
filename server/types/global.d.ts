/**
 * YApi 运行时全局与 yapi 单例扩展
 */
import type { Hono } from "hono";

export interface YapiWebConfig {
  port?: number;
  adminAccount?: string;
  closeRegister?: boolean;
  db?: Record<string, unknown>;
  mail?: Record<string, unknown>;
  ldap?: Record<string, unknown>;
  /** 第三方集成（如 qsso），与内置 /api/extensions 无关 */
  integrations?: unknown[];
  [key: string]: unknown;
}

export interface YapiRuntime {
  fs: typeof import("fs-extra");
  path: typeof import("path");
  WEBROOT: string;
  WEBROOT_SERVER: string;
  WEBROOT_RUNTIME: string;
  WEBROOT_LOG: string;
  WEBCONFIG: YapiWebConfig;
  getInst: <T>(m: new (...args: unknown[]) => T, ...args: unknown[]) => T;
  delInst: (m: unknown) => void;
  getInsts: Map<unknown, unknown>;
  mail?: import("nodemailer").Transporter;
  commons?: Record<string, unknown>;
  connect?: Promise<unknown>;
  app?: Hono;
}

declare global {
  // eslint-disable-next-line no-var
  var storageCreator: (id: string) => unknown;
}

declare const yapi: YapiRuntime;

export {};
