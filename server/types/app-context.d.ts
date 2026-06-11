/**
 * 控制器层使用的请求上下文（由 lib/context.ts 从 Hono Context 构建）
 */
export interface AppRequest {
  body: Record<string, unknown>;
  query: Record<string, string | string[]>;
  header: Record<string, string>;
  headers: Record<string, string>;
  method: string;
  path: string;
  url: string;
  files: Record<string, unknown>;
}

export interface AppWebSocket {
  send(data: string | object): void;
  on(event: "close" | "message", handler: (...args: unknown[]) => void): void;
}

export interface AppContext {
  req: unknown;
  request: AppRequest;
  query: Record<string, string | string[]>;
  params: Record<string, string>;
  path: string;
  method: string;
  hostname: string;
  header: Record<string, string>;
  headers: Record<string, string>;
  body: unknown;
  status: number;
  type: string;
  _responseHeaders: Record<string, string>;
  _redirect?: string;
  cookies: {
    get(name: string): string | undefined;
    set(name: string, value: string | null | undefined, opts?: Record<string, unknown>): void;
  };
  set(key: string, value: string): void;
  redirect(url: string): void;
  websocket?: AppWebSocket;
  ws?: AppWebSocket;
}

export interface AppContextAdapter {
  createAppContext(c: unknown, options?: { websocket?: unknown }): Promise<AppContext>;
  finalizeResponse(c: unknown, ctx: AppContext): Promise<Response>;
}
