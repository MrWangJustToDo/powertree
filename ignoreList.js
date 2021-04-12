// 默认忽略一些文件夹，不进行递归显示
const ignoreList = {
  node_modules: 1,
  dist: 1,
  dev: 1,
  ".git": 1,
  ".cache": 1,
  ".npm": 1,
  ".wine": 1,
  ".vscode": 1,
  ".yarn": 1,
  ".android": 1,
  ".java": 1,
  maven: 1,
  ".next": 1,
  build: 1,
};

exports.ignoreList = ignoreList;
