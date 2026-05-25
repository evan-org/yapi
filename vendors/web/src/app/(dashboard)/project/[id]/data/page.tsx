import { redirect } from "next/navigation";

/**
 * 旧版「数据管理」路由：环境与数据已合并到项目设置
 */
export default async function ProjectDataPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/project/${id}/setting`);
}
