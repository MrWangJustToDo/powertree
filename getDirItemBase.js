const fs = require("fs");
const chalk = require("chalk");

const { readDir } = require("./tools");
const { ignoreList } = require("./ignoreList");

/**
 * 普通模式输出
 * @param {string} currentDirPath 当前文件夹全路径
 * @param {string} currentDirName 当前文件夹名称
 * @param {string} currentPreString 当前待连接的前缀 如 |  |  |, 注意传入时需要slice(0, -1), 因为会和下面的joinString进行拼接
 * @param {string} joinString 当前需要连接的字符串 如 |--
 * @param {boolean} colorful 是否是彩色显示模式
 * @returns {Promise<fs.Dirent[]>}
 */
function getDirRowBase(
  currentDirPath,
  currentDirName,
  currentPreString,
  joinString,
  colorful
) {
  return readDir(currentDirPath, { withFileTypes: true }).then(
    (currentDirItemArr) => {
      let current = currentPreString + joinString;
      if (colorful) {
        current += chalk.blue(currentDirName);
      } else {
        current += currentDirName;
      }
      console.log(current);
      if (ignoreList(currentDirName)) {
        throw -1;
      }
      return currentDirItemArr;
    }
  );
}

exports.getDirRowBase = getDirRowBase;
