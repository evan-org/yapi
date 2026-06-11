// @ts-nocheck
/**
 * 通知与动态日志：邮件、项目通知、操作日志落库
 *
 * 从 utils/commons.ts 与 utils/notice.ts 迁出，解除工具层对 repositories 的依赖
 */
import { appLog } from "../utils/app-log.js";
import { getAppConfig, getMailTransport } from "../shared/config.js";
import {
  logRepository,
  projectRepository,
  userRepository,
  followRepository,
} from "../repositories/index.js";

function arrUnique(arr1, arr2) {
  const arr = arr1.concat(arr2);
  return arr.filter((item, index, array) => array.indexOf(item) === index);
}

const noticeChannels = {
  mail: {
    title: "邮件",
    handler: (emails, title, content) => {
      notificationService.sendMail({
        to: emails,
        contents: content,
        subject: title,
      });
    },
  },
};

class NotificationService {
  /**
   * 写入操作动态（异步落库，失败仅打日志）
   */
  saveLog(logData) {
    try {
      const data = {
        content: logData.content,
        type: logData.type,
        uid: logData.uid,
        username: logData.username,
        typeid: logData.typeid,
        data: logData.data,
      };
      logRepository.save(data).then();
    } catch (e) {
      appLog(e, "error");
    }
  }

  /**
   * 发送邮件（依赖 yapi.mail 配置）
   */
  sendMail(options, cb) {
    const mail = getMailTransport();
    if (!mail) {
      return false;
    }
    options.subject = options.subject
      ? options.subject + "-YApi 平台"
      : "YApi 平台";

    const callback =
      cb ||
      function (err) {
        if (err) {
          appLog("send mail " + options.to + " error," + err.message, "error");
        } else {
          appLog("send mail " + options.to + " success");
        }
      };

    try {
      mail.sendMail(
        {
          from: getAppConfig().mail.from,
          to: options.to,
          subject: options.subject,
          html: options.contents,
        },
        callback
      );
    } catch (e) {
      appLog(e.message, "error");
      console.error(e.message); // eslint-disable-line
    }
  }

  /**
   * 向关注者及开启邮件通知的项目成员发送通知
   */
  async sendNotice(projectId, data) {
    const starUsers = (
      await followRepository.listByProjectId(projectId)
    ).map((item) => item.uid);

    const projectList = await projectRepository.get(projectId);
    const projectMembers = projectList.members
      .filter((item) => item.email_notice)
      .map((item) => item.uid);

    const users = arrUnique(projectMembers, starUsers);
    const usersInfo = await userRepository.findByUids(users);
    const emails = usersInfo.map((item) => item.email).join(",");

    try {
      Object.keys(noticeChannels).forEach((key) => {
        const noticeItem = noticeChannels[key];
        try {
          noticeItem.handler(emails, data.title, data.content);
        } catch (err) {
          appLog(
            "发送" + (noticeItem.title || key) + "失败" + err.message,
            "error"
          );
        }
      });
    } catch (e) {
      appLog("发送失败：" + e, "error");
    }
  }

  /** 挂载到 yapi.commons（兼容历史调用路径） */
  attachToCommons(commons) {
    commons.sendNotice = this.sendNotice.bind(this);
  }
}

const notificationService = new NotificationService();
export default notificationService;
