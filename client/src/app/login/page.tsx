"use client";

/**
 * 登录页：邮箱/密码、LDAP
 */
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiCode } from "../../lib/api/types";
import { userApi } from "../../lib/api/client";
import { useAuth } from "../../lib/auth/auth-context";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Alert, AlertDescription } from "../../components/ui/alert";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh, isLDAP, canRegister } = useAuth();
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#2395f1]/10 via-background to-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-xl bg-[#2395f1] text-2xl font-bold text-white">
            Y
          </div>
          <CardTitle className="text-2xl">YAPI</CardTitle>
          <CardDescription>登录以管理 API 项目</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">登录</TabsTrigger>
              <TabsTrigger value="register" disabled={!canRegister}>
                注册
              </TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="mt-4 space-y-4">
              {isLDAP ? (
                <div className="flex gap-2 text-sm">
                  <Button
                    type="button"
                    size="sm"
                    variant={loginType === "ldap" ? "default" : "outline"}
                    onClick={() => setLoginType("ldap")}
                  >
                    LDAP
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={loginType === "normal" ? "default" : "outline"}
                    onClick={() => setLoginType("normal")}
                  >
                    普通登录
                  </Button>
                </div>
              ) : null}
              {error ? (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button
                className="w-full bg-[#2395f1] hover:bg-[#2395f1]/90"
                disabled={loading}
                onClick={() => handleLogin(isLDAP && loginType === "ldap")}
              >
                {loading ? "登录中…" : "登录"}
              </Button>
            </TabsContent>
            <TabsContent value="register" className="mt-4 space-y-4">
              {!canRegister ? (
                <p className="text-sm text-muted-foreground">管理员已禁止注册，请联系管理员。</p>
              ) : (
                <>
                  {error ? (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  ) : null}
                  <div className="space-y-2">
                    <Label htmlFor="reg-username">用户名</Label>
                    <Input
                      id="reg-username"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">邮箱</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">密码</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                    />
                  </div>
                  <Button
                    className="w-full bg-[#2395f1] hover:bg-[#2395f1]/90"
                    disabled={regLoading}
                    onClick={async () => {
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
                    }}
                  >
                    {regLoading ? "注册中…" : "注册"}
                  </Button>
                </>
              )}
              <Button variant="link" className="px-0" asChild>
                <Link href="/">返回首页</Link>
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
