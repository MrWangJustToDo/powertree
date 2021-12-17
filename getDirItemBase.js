const chalk = require("chalk");

const { readDir } = require("./tools");
const { ignoreList } = require("./ignoreList");

/**
 * 普通模式输出
 * @param {String} currentDirPath 当前文件夹全路径
 * @param {String} currentDirName 当前文件夹名称
 * @param {String} currentPreString 当前待连接的前缀 如 |  |  |, 注意传入时需要slice(0, -1), 因为会和下面的joinString进行拼接
 * @param {String} joinString 当前需要连接的字符串 如 |--
 * @param {Boolean} colorful 是否是彩色显示模式
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
      if (ignoreList[currentDirName]) {
        throw -1;
      }
      return currentDirItemArr;
    }
  );
}

exports.getDirRowBase = getDirRowBase;
