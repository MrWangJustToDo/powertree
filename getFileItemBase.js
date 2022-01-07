const path = require("path");
const chalk = require("chalk");

const { getColor } = require("./getCurrentColor");
const { fileStat, getChmod, execFileJudge } = require("./tools");

/**
 * 普通模式输出
 * @param {string} currentDirPath 当前文件所在文件夹的名称
 * @param {string} currentFileName 当前文件的名称
 * @param {string} currentPreString 当前文件输出的前缀，类似于| | | | 最后一个不需要取消，因为文件是当前文件夹的子项，会有额外前缀
 * @param {boolean} colorful 当前显示是否是颜色模式
 * @param {string} joinString 当前文件输出的连接字符串，类似于|--
 */
function getFileRowBase(
  currentDirPath,
  currentFileName,
  currentPreString,
  colorful,
  joinString
) {
  if (!colorful) {
    return Promise.resolve(
      console.log(currentPreString + joinString + currentFileName)
    );
  } else {
    return fileStat(path.join(currentDirPath, currentFileName)).then(
      (currentFileState) => {
        const mode = getChmod(currentFileState.mode);
        const flag = execFileJudge(mode);
        let currentTemp = currentPreString + joinString;
        if (flag) {
          currentTemp += chalk
            .hex(getColor(currentFileName, false, true))
            .bold(currentFileName + "*");
        } else {
          currentTemp += chalk
            .hex(getColor(currentFileName, false, false))
            .bold(currentFileName);
        }
        console.log(currentTemp);
      }
    );
  }
}

function catchErrorRowBase(
  currentDirPath,
  currentPreString,
  joinString,
  error = "look like not file or dir"
) {
  console.log(
    currentPreString +
      joinString +
      chalk.red(`${error}, path: `) +
      chalk.blue(currentDirPath)
  );
}

exports.getFileRowBase = getFileRowBase;
exports.catchErrorRowBase = catchErrorRowBase;
