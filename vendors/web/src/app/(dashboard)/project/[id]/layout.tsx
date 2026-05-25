"use client";

/**
 * 项目布局：面包屑、侧栏导航
 */
import { ProjectShell } from "../../../../components/project/project-shell";

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  return <ProjectShell>{children}</ProjectShell>;
}
