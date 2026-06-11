// @ts-nocheck
/**
 * 用户模块：资料、头像与引导状态
 */
import yapi from "../../runtime.js";
import commons from "../../utils/commons.js";
import { nowSeconds } from "../../shared/clock.js";
import { clientPublicFile } from "../../utils/client-public.js";
import { ok, fail } from "../service-result.js";
import { parseAvatarBasecode } from "../user.validation.js";
import { repos, errorMessage, type UserActor } from "./shared.js";

const { userModel, groupModel, projectModel, avatarModel } = repos;

export async function markStudyDone(uid: number | string) {
  try {
    const result = await userModel.update(uid, {
      up_time: nowSeconds(),
      study: true,
    });
    return ok(result);
  } catch (e) {
    return fail(401, errorMessage(e));
  }
}

export async function updateProfile(
  params: { uid?: number | string; username?: string; email?: string },
  actor: UserActor
) {
  const normalized = commons.handleParams(params, {
    username: "string",
    email: "string",
  }) as { uid?: number | string; username?: string; email?: string };
  if (actor.role !== "admin" && normalized.uid != actor.currentUid) {
    return fail(401, "没有权限");
  }
  const id = normalized.uid;
  if (!id) {
    return fail(400, "uid不能为空");
  }
  try {
    const userData = await userModel.findById(id);
    if (!userData) {
      return fail(400, "uid不存在");
    }
    const data: Record<string, unknown> = { up_time: nowSeconds() };
    if (normalized.username) {
      data.username = normalized.username;
    }
    if (normalized.email) {
      data.email = normalized.email;
    }
    if (data.email) {
      const checkRepeat = await userModel.checkRepeat(data.email);
      if (checkRepeat > 0) {
        return fail(401, "该email已经注册");
      }
    }
    const member = {
      uid: id,
      username: (data.username as string) || userData.username,
      email: (data.email as string) || userData.email,
    };
    await groupModel.updateMember(member);
    await projectModel.updateMember(member);
    const result = await userModel.update(id, data);
    return ok(result);
  } catch (e) {
    return fail(402, errorMessage(e));
  }
}

export async function uploadAvatar(uid: number | string, basecode: string | undefined) {
  const parsed = parseAvatarBasecode(basecode);
  if (!parsed.ok) {
    return parsed;
  }
  try {
    const result = await avatarModel.up(
      String(uid),
      parsed.data.payload,
      parsed.data.type
    );
    return ok(result);
  } catch (e) {
    return fail(401, errorMessage(e));
  }
}

export async function getAvatarBuffer(uid: number | string) {
  try {
    const data = await avatarModel.get(uid);
    if (!data || !data.basecode) {
      return ok({
        type: "image/png",
        buffer: yapi.fs.readFileSync(clientPublicFile("image", "avatar.png")),
      });
    }
    return ok({
      type: data.type,
      buffer: Buffer.from(data.basecode, "base64"),
    });
  } catch (err) {
    return fail(500, errorMessage(err));
  }
}
