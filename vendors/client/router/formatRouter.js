/**
 * @name 格式话 router 使符合 react-router规范
 * */
// 递归解析children
function formatRouterChildren(arr, list = [], fPath) {
  for (let i = 0; i < arr.length; i++) {
    //
    if (arr[i].component) {
      list.push({
        ...arr[i],
        path: useFullPath(arr[i].path, fPath),
        component: arr[i].component,
        children: []
      })
    }
    //
    if (arr[i].children && Array.isArray(arr[i].children) && arr[i].children.length > 0) {
      formatRouterChildren(arr[i].children, list, useFullPath(arr[i].path, fPath))
    }
  }
  return list
}
// 判断 路由里第一位是否是 / 选择是否拼接路由
function useFullPath(path, parentPath) {
  if (!path) {
    path = "/";
  }
  path = path.toString();
  parentPath = parentPath.substr(parentPath.length - 1, 1) === "/" ? parentPath : parentPath + "/";
  return path.substring(0, 1) === "/" ? path : parentPath + path;
}
// 格式化列表
export function formatRouterList(arr) {
  try {
    let newListArray = [];
    for (let i = 0; i < arr.length; i++) {
      //
      if (arr[i].component) {
        newListArray.push({
          ...arr[i],
          path: arr[i].path,
          component: arr[i].component,
          children: []
        })
      }
      //
      if (arr[i].children && Array.isArray(arr[i].children) && arr[i].children.length > 0) {
        // 这里解释一下防止有人疑惑, 首先需要明白引用类型和基本类型
        // 基本类型是传值, 引用类型是传址, 在js中数组和对象是引用类型, 所以我传入的newListArr实际上是把内存地址传了过去, 所以修改形参可以修改实参
        // 具体到这个例子中来说 我在formatRouterChildren方法中修改形参可以把传入的formatRouterList中的newListArr修改掉
        formatRouterChildren(arr[i].children, newListArray, arr[i].path)
      }
    }
    return newListArray;
  } catch (e) {
    console.warn(e);
  }
}
