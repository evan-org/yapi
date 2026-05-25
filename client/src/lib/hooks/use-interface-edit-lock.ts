"use client";

/**
 * 接口协同编辑锁：通过 WebSocket 连接 /api/interface/solve_conflict
 */
import { useCallback, useEffect, useRef, useState } from "react";

export interface EditLockConflict {
  uid: number;
  username: string;
}

interface UseInterfaceEditLockOptions {
  interfaceId: number;
  /** 为 true 时尝试抢占编辑锁 */
  active: boolean;
}

interface UseInterfaceEditLockResult {
  /** 是否已成功获得编辑锁 */
  hasLock: boolean;
  /** 他人正在编辑时的占用者信息 */
  conflict: EditLockConflict | null;
  /** WebSocket 连接状态 */
  connected: boolean;
  /** 连接或协议错误信息 */
  error: string;
  /** 手动释放锁并断开 */
  release: () => void;
}

/**
 * 解析 WebSocket 基址：优先 NEXT_PUBLIC_YAPI_WS_URL，否则由 API 地址或当前页面推导
 */
function resolveWebSocketOrigin(): string {
  if (typeof window === "undefined") {
    return "";
  }
  const explicit = process.env.NEXT_PUBLIC_YAPI_WS_URL;
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }
  const apiUrl = process.env.NEXT_PUBLIC_YAPI_API_URL;
  if (apiUrl) {
    try {
      const u = new URL(apiUrl);
      u.protocol = u.protocol === "https:" ? "wss:" : "ws:";
      return u.origin;
    } catch (err) {
      console.error("解析 NEXT_PUBLIC_YAPI_API_URL 失败", err);
    }
  }
  const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${window.location.host}`;
}

/**
 * 接口编辑锁 Hook
 */
export function useInterfaceEditLock({
  interfaceId,
  active,
}: UseInterfaceEditLockOptions): UseInterfaceEditLockResult {
  const wsRef = useRef<WebSocket | null>(null);
  const [hasLock, setHasLock] = useState(false);
  const [conflict, setConflict] = useState<EditLockConflict | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");

  const release = useCallback(() => {
    const ws = wsRef.current;
    if (ws) {
      wsRef.current = null;
      try {
        ws.close();
      } catch (err) {
        console.error("关闭编辑锁 WebSocket 失败", err);
      }
    }
    setHasLock(false);
    setConnected(false);
    setConflict(null);
  }, []);

  useEffect(() => {
    if (!active || !interfaceId) {
      release();
      return;
    }

    const origin = resolveWebSocketOrigin();
    if (!origin) {
      setError("无法解析 WebSocket 地址");
      return;
    }

    const url = `${origin}/api/interface/solve_conflict?id=${interfaceId}`;
    console.log("连接接口编辑锁", url);
    setError("");
    setConflict(null);
    setHasLock(false);

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      console.log("编辑锁 WebSocket 已连接", interfaceId);
    };

    ws.onmessage = (ev) => {
      try {
        const payload = JSON.parse(String(ev.data)) as {
          errno?: number;
          data?: { uid?: number; username?: string };
        };
        if (payload.errno && payload.errno !== 0) {
          setHasLock(false);
          setConflict({
            uid: payload.data?.uid || payload.errno,
            username: payload.data?.username || "其他用户",
          });
          console.log("接口正在被他人编辑", payload.data?.username);
        } else {
          setConflict(null);
          setHasLock(true);
          console.log("已获得接口编辑锁", interfaceId);
        }
      } catch (err) {
        console.error("解析编辑锁消息失败", err);
        if (String(ev.data).includes("id 参数有误")) {
          setError("接口 id 无效");
        }
      }
    };

    ws.onerror = () => {
      setError("编辑锁连接失败，请确认后端 WebSocket 已启动");
      setConnected(false);
      console.error("编辑锁 WebSocket 错误", interfaceId);
    };

    ws.onclose = () => {
      setConnected(false);
      setHasLock(false);
      wsRef.current = null;
      console.log("编辑锁 WebSocket 已断开", interfaceId);
    };

    return () => {
      release();
    };
  }, [active, interfaceId, release]);

  return { hasLock, conflict, connected, error, release };
}
