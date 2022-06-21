// 默认忽略一些文件夹，不进行递归显示
const ignoreList = (name) => {
  if (typeof name === "string" && name.startsWith(".")) {
    return true;
  }
  return commonIgnoreList[name];
};

const commonIgnoreList = {
  node_modules: 1,
  maven: 1,
  build: 1,
  dist: 1,
  dev: 1,
};

exports.ignoreList = ignoreList;
