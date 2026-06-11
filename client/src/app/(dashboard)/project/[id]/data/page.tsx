import { redirect } from "next/navigation";

/**
 * 兼容路由：重定向到项目设置（环境与数据）
 */
export default async function ProjectDataPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/project/${id}/setting`);
}
