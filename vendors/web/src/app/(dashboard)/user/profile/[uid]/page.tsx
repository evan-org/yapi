"use client";

/**
 * 个人中心：资料与密码
 */
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { userApi } from "@/lib/api/user";
import { useAuth } from "@/lib/auth/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function UserProfilePage() {
  const params = useParams();
  const uid = Number(params.uid);
  const { user, refresh } = useAuth();
  const canEdit = user?._id === uid || user?.role === "admin";
  const [error, setError] = useState("");
  const [profile, setProfile] = useState({ username: "", email: "" });
  const [passwords, setPasswords] = useState({ old_password: "", password: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await userApi.find(uid);
      const data = res.data as { username: string; email: string };
      setProfile({ username: data.username || "", email: data.email || "" });
    } catch (err) {
      console.error("加载用户资料失败", err);
      setError(err instanceof Error ? err.message : "加载失败");
    }
  }, [uid]);

  useEffect(() => {
    if (!Number.isNaN(uid)) {
      load();
    }
  }, [uid, load]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!canEdit) return;
    setSaving(true);
    setError("");
    try {
      await userApi.update({ uid, username: profile.username, email: profile.email });
      await refresh();
      console.log("资料已更新", uid);
    } catch (err) {
      console.error("更新资料失败", err);
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!canEdit) return;
    setSaving(true);
    setError("");
    try {
      await userApi.changePassword({
        uid,
        password: passwords.password,
        old_password: passwords.old_password || undefined,
      });
      setPasswords({ old_password: "", password: "" });
      console.log("密码已修改", uid);
    } catch (err) {
      console.error("修改密码失败", err);
      setError(err instanceof Error ? err.message : "修改失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>个人中心</CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        {!canEdit ? (
          <p className="text-sm text-muted-foreground">仅本人或管理员可编辑</p>
        ) : null}
        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">基本资料</TabsTrigger>
            <TabsTrigger value="password">修改密码</TabsTrigger>
          </TabsList>
          <TabsContent value="profile" className="mt-4">
            <form onSubmit={saveProfile} className="space-y-4">
              <div className="space-y-2">
                <Label>用户名</Label>
                <Input
                  value={profile.username}
                  disabled={!canEdit}
                  onChange={(e) => setProfile((p) => ({ ...p, username: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>邮箱</Label>
                <Input
                  type="email"
                  value={profile.email}
                  disabled={!canEdit}
                  onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                />
              </div>
              {canEdit ? (
                <Button type="submit" disabled={saving}>
                  {saving ? "保存中…" : "保存资料"}
                </Button>
              ) : null}
            </form>
          </TabsContent>
          <TabsContent value="password" className="mt-4">
            <form onSubmit={savePassword} className="space-y-4">
              <div className="space-y-2">
                <Label>原密码</Label>
                <Input
                  type="password"
                  value={passwords.old_password}
                  disabled={!canEdit}
                  onChange={(e) =>
                    setPasswords((p) => ({ ...p, old_password: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>新密码</Label>
                <Input
                  type="password"
                  value={passwords.password}
                  disabled={!canEdit}
                  onChange={(e) => setPasswords((p) => ({ ...p, password: e.target.value }))}
                  required
                />
              </div>
              {canEdit ? (
                <Button type="submit" disabled={saving}>
                  {saving ? "提交中…" : "修改密码"}
                </Button>
              ) : null}
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
