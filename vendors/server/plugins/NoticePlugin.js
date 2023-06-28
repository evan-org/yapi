const yapi = require("@server/yapi.js");
function arrUnique(arr1, arr2) {
  let arr = arr1.concat(arr2);
  return arr.filter(function(item, index, arr) {
    return arr.indexOf(item) === index;
  });
}
/*  */
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

const NoticePlugin = () => {
  /*  */
  yapi.emitHook("addNotice", noticeObj)
  yapi.commons.sendNotice = async function(projectId, data) {
    const projectModel = require("@server/models/ProjectModel.js");
    const userModel = require("@server/models/UserModel.js");
    const followModel = require("@server/models/FollowModel.js");
    const followInst = yapi.getInst(followModel);
    const userInst = yapi.getInst(userModel);
    const projectInst = yapi.getInst(projectModel);
    const list = await followInst.listByProjectId(projectId);
    const starUsers = list.map((item) => item.uid);
    const projectList = await projectInst.get(projectId);
    const projectMenbers = projectList.members.filter((item) => item.email_notice).map((item) => item.uid);
    const users = arrUnique(projectMenbers, starUsers);
    const usersInfo = await userInst.findByUids(users);
    const emails = usersInfo.map((item) => item.email).join(",");
    try {
      Object.keys(noticeObj).forEach((key) => {
        let noticeItem = noticeObj[key];
        try {
          noticeItem.hander(emails, data.title, data.content)
        } catch (err) {
          yapi.commons.log("发送" + (noticeItem.title || key) + "失败" + err.message, "error")
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
  console.info("------------------------------------------NoticePlugin successfully!------------------------------------------");
}

module.exports = NoticePlugin;
