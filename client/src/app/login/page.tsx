"use client";

/**
 * 登录页：Vercel 风格深色极简布局
 */
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiCode } from "../../lib/api/types";
import { userApi } from "../../lib/api/client";
import { useAuth } from "../../lib/auth/auth-context";

type AuthMode = "login" | "register";

const inputClass =
  "h-10 w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 text-sm text-white placeholder:text-neutral-600 outline-none transition-colors focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600";

const labelClass = "text-xs font-medium text-neutral-400";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh, isLDAP, canRegister } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState<"ldap" | "normal">("ldap");
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  const redirect = searchParams.get("redirect") || "/group";

  async function handleLogin(useLdap: boolean) {
    setError("");
    setLoading(true);
    try {
      const res = useLdap
        ? await userApi.loginLdap(email, password)
        : await userApi.login(email, password);
      if (res.errcode === ApiCode.SUCCESS) {
        await refresh();
        router.replace(redirect);
        console.log("登录成功");
      } else {
        setError(res.errmsg || "登录失败");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "登录失败";
      setError(msg);
      console.error("登录失败", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister() {
    setError("");
    setRegLoading(true);
    try {
      const res = await userApi.register({
        email: regEmail,
        password: regPassword,
        username: regUsername,
      });
      if (res.errcode === ApiCode.SUCCESS) {
        await refresh();
        router.replace(redirect);
        console.log("注册成功");
      } else {
        setError(res.errmsg || "注册失败");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "注册失败");
      console.error("注册失败", err);
    } finally {
      setRegLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* 背景：径向光晕 + 网格 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.18),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"
      />

      <header className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-800 bg-neutral-950 transition-colors group-hover:border-neutral-600">
            <svg viewBox="0 0 76 65" className="h-3.5 w-3.5 fill-white" aria-hidden>
              <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
            </svg>
          </span>
          <span className="text-sm font-medium tracking-tight text-white">YApi</span>
        </Link>
        <Link
          href="/"
          className="text-sm text-neutral-400 transition-colors hover:text-white"
        >
          返回首页
        </Link>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 pb-16 pt-4">
        <div className="w-full max-w-[360px]">
          <div className="mb-8 text-center sm:text-left">
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              {mode === "login" ? "登录 YApi" : "创建账号"}
            </h1>
            <p className="mt-2 text-sm text-neutral-400">
              {mode === "login"
                ? "使用邮箱与密码管理你的 API 项目"
                : "注册后即可创建分组与接口文档"}
            </p>
          </div>

          {/* 登录 / 注册切换 */}
          <div className="mb-6 flex rounded-lg border border-neutral-800 bg-neutral-950 p-1">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
              }}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
                mode === "login"
                  ? "bg-neutral-800 text-white shadow-sm"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              登录
            </button>
            <button
              type="button"
              disabled={!canRegister}
              onClick={() => {
                setMode("register");
                setError("");
              }}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                mode === "register"
                  ? "bg-neutral-800 text-white shadow-sm"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              注册
            </button>
          </div>

          {error ? (
            <div
              role="alert"
              className="mb-4 rounded-md border border-red-900/80 bg-red-950/40 px-3 py-2 text-sm text-red-300"
            >
              {error}
            </div>
          ) : null}

          {mode === "login" ? (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                void handleLogin(isLDAP && loginType === "ldap");
              }}
            >
              {isLDAP ? (
                <div className="flex gap-1 rounded-lg border border-neutral-800 bg-neutral-950 p-1">
                  <button
                    type="button"
                    onClick={() => setLoginType("ldap")}
                    className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
                      loginType === "ldap"
                        ? "bg-neutral-800 text-white"
                        : "text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    LDAP
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginType("normal")}
                    className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
                      loginType === "normal"
                        ? "bg-neutral-800 text-white"
                        : "text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    邮箱登录
                  </button>
                </div>
              ) : null}

              <div className="space-y-2">
                <label htmlFor="email" className={labelClass}>
                  邮箱
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className={inputClass}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className={labelClass}>
                  密码
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex h-10 w-full items-center justify-center rounded-md bg-white text-sm font-medium text-black transition-colors hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                    登录中…
                  </span>
                ) : (
                  "继续"
                )}
              </button>
            </form>
          ) : (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                void handleRegister();
              }}
            >
              {!canRegister ? (
                <p className="rounded-md border border-neutral-800 bg-neutral-950 px-3 py-4 text-sm text-neutral-400">
                  管理员已关闭注册，请联系管理员开通账号。
                </p>
              ) : (
                <>
                  <div className="space-y-2">
                    <label htmlFor="reg-username" className={labelClass}>
                      用户名
                    </label>
                    <input
                      id="reg-username"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="reg-email" className={labelClass}>
                      邮箱
                    </label>
                    <input
                      id="reg-email"
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="reg-password" className={labelClass}>
                      密码
                    </label>
                    <input
                      id="reg-password"
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className={inputClass}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={regLoading}
                    className="mt-2 flex h-10 w-full items-center justify-center rounded-md bg-white text-sm font-medium text-black transition-colors hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {regLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                        注册中…
                      </span>
                    ) : (
                      "创建账号"
                    )}
                  </button>
                </>
              )}
            </form>
          )}

          <p className="mt-8 text-center text-xs leading-relaxed text-neutral-600">
            继续即表示你同意在组织内合规使用本平台。
            <br />
            <span className="text-neutral-700">API 管理平台 · 自托管部署</span>
          </p>
        </div>
      </main>
    </div>
  );
}
