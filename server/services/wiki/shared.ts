// @ts-nocheck
/**
 * Wiki 子模块共享：仓储引用与类型
 */
import {
  wikiRepository,
  projectRepository,
  userRepository,
} from "../../repositories/index.js";

export const repos = {
  wikiModel: wikiRepository,
  projectModel: projectRepository,
  userModel: userRepository,
};

export type WikiSaveParams = {
  project_id: number;
  desc?: string;
  markdown?: string;
  email_notice?: boolean;
};

export type WikiSaveContext = {
  username: string;
  uid: number;
  wikiUrl: string;
};
