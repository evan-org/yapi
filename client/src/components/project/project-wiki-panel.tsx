"use client";

/**
 * 项目 Wiki：Markdown 查看与编辑
 */
import { useCallback, useEffect, useState } from "react";
import { builtinApi } from "../../lib/api/builtin";
import { Button } from "../ui/button";
import { MarkdownRichEditor } from "../shared/markdown-rich-editor";
import { MarkdownPreview } from "../shared/markdown-preview";
import { Alert, AlertDescription } from "../ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface ProjectWikiPanelProps {
  projectId: number;
}

export function ProjectWikiPanel({ projectId }: ProjectWikiPanelProps) {
  const [markdown, setMarkdown] = useState("");
  const [desc, setDesc] = useState("");
  const [username, setUsername] = useState("");
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await builtinApi.wikiGet(projectId);
      const data = res.data as { markdown?: string; desc?: string; username?: string };
      setMarkdown(data.markdown || "");
      setDesc(data.desc || "");
      setUsername(data.username || "");
    } catch (err) {
      console.error("加载 Wiki 失败", err);
      setError(err instanceof Error ? err.message : "加载失败");
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      await builtinApi.wikiUpdate({
        project_id: projectId,
        markdown,
        desc,
      });
      setEditing(false);
      await load();
      console.log("Wiki 已保存", projectId);
    } catch (err) {
      console.error("保存 Wiki 失败", err);
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>项目 Wiki</CardTitle>
          {username ? (
            <p className="text-xs text-muted-foreground">最近编辑：{username}</p>
          ) : null}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => (editing ? handleSave() : setEditing(true))}
          disabled={saving}
        >
          {editing ? (saving ? "保存中…" : "保存") : "编辑"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        {editing ? (
          <MarkdownRichEditor
            value={markdown}
            onChange={setMarkdown}
            height={360}
          />
        ) : (
          <MarkdownPreview
            content={markdown}
            emptyHint="暂无 Wiki 内容，点击编辑开始编写。"
          />
        )}
      </CardContent>
    </Card>
  );
}
