// @ts-nocheck
import yapi from "../runtime.js";
import {
  projectRepository,
  userRepository,
  followRepository,
} from "../repositories/index.js";


function arrUnique(arr1, arr2) {
  let arr = arr1.concat(arr2);
  let res = arr.filter(function(item, index, arr) {
    return arr.indexOf(item) === index;
  });
  return res;
}

const noticeObj = {
  mail: {
    title: "邮件",
    hander: (emails, title, content) => {
      yapi.commons.sendMail({
        to: emails,
        contents: content,
        subject: title
      });
    }
  }
}

yapi.emitHook("addNotice", noticeObj)

yapi.commons.sendNotice = async function (projectId, data) {
  const followInst = followRepository;
  const userInst = userRepository;
  const projectInst = projectRepository;
  const list = await followInst.listByProjectId(projectId);
  const starUsers = list.map((item) => item.uid);

  const projectList = await projectInst.get(projectId);
  const projectMenbers = projectList.members
    .filter((item) => item.email_notice)
    .map((item) => item.uid);

  const users = arrUnique(projectMenbers, starUsers);
  const usersInfo = await userInst.findByUids(users);
  const emails = usersInfo.map((item) => item.email).join(",");

  try {
    Object.keys(noticeObj).forEach((key) => {
      let noticeItem = noticeObj[key];
      try {
        noticeItem.hander(emails, data.title, data.content)
      } catch (err) {
        yapi.commons.log("发送" + (noticeItem.title || key) + "失败" + err.message,  "error")
      }
    })
    // yapi.commons.sendMail({
    //   to: emails,
    //   contents: data.content,
    //   subject: data.title
    // });
  } catch (e) {
    yapi.commons.log("发送失败：" + e, "error");
  }
};
