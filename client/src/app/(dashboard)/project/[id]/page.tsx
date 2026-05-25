import { redirect } from "next/navigation";

/**
 * 项目根路径重定向到接口列表
 */
export default async function ProjectIndexPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/project/${id}/interface/api`);
}
