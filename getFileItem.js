const path = require("path");
const chalk = require("chalk");
const prettyBytes = require("pretty-bytes");

const { getColor } = require("./getCurrentColor");
const { fileStat, getChmod, execFileJudge } = require("./tools");

/**
 * 普通模式输出
 * @param {String} currentDirName 当前文件所在文件夹的名称
 * @param {String} currentFileName 当前文件的名称
 * @param {String} currentPreString 当前文件输出的前缀，类似于| | | | 最后一个不需要取消，因为文件是当前文件夹的子项，会有额外前缀
 * @param {Boolean} colorful 当前显示是否是颜色模式
 * @param {String} joinString 当前文件输出的连接字符串，类似于|--
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

/**
 *
 * @param {String} lastRe 之前的输出返回
 * @param {String} currentDirPath 当前文件夹全路径
 * @param {String} currentFileName 当前文件名称
 * @param {String} currentPreString 当前层级的文件前缀
 * @param {String} currentPreExtendString 当前层级的扩展前缀
 * @param {String} joinString 当前层级连接字符串
 * @param {String} initPad 基本输出与扩展之间的间距
 * @param {String} currentColor 当前层级文件的输出颜色
 * @returns {Promise} 返回一个Promise， resolve时的参数为一个对象包括当前字符串输出以及文件大小
 */
function getFileRowExtend(
  lastRe,
  currentDirPath,
  currentFileName,
  currentPreString,
  currentPreExtendString,
  joinString,
  initPad,
  currentColor
) {
  return fileStat(path.join(currentDirPath, currentFileName)).then(
    (fileState) => {
      const mode = getChmod(fileState.mode);
      const flag = execFileJudge(mode);
      let currentTemp = `-${mode} `;
      currentTemp += currentPreString + joinString + currentFileName;
      if (currentColor) {
        flag && (currentTemp += "*");
      }
      if (currentTemp.length > initPad) {
        if (initPad < 3) {
          currentTemp = ".".repeat(initPad);
        } else {
          // 超出显示优化
          currentTemp = currentTemp.slice(0, initPad - 3) + "...";
        }
      }
      currentTemp = currentTemp.padEnd(initPad);
      currentTemp += currentPreExtendString + joinString;
      currentTemp += prettyBytes(fileState.size).padEnd(10);
      if (currentColor) {
        currentTemp += `mtime: ${new Date(
          fileState.mtime
        ).toLocaleDateString()}\n`;
        currentTemp = chalk.hex(currentColor).bold(currentTemp);
      } else {
        currentTemp += chalk.cyan(
          `mtime: ${new Date(fileState.mtime).toLocaleDateString()}\n`
        );
      }
      lastRe += currentTemp;
      return { lastRe, size: fileState.size };
    }
  );
}

/**
 *
 * @param {String} lastRe 之前的输出返回
 * @param {String} currentDirPath 当前文件夹全路径
 * @param {String} currentFileName 当前文件名称
 * @param {String} currentPreString 当前层级的文件前缀
 * @param {String} currentPreExtendString 当前层级的扩展前缀
 * @param {String} joinString 当前层级连接字符串
 * @param {String} initPad 基本输出与扩展之间的间距
 * @param {String} currentColor 当前层级文件的输出颜色
 * @returns {Promise} 返回一个Promise，resolve出拼接后的字符串
 */
function catchErrorRowExtend(
  lastRe,
  currentDirPath,
  currentFileName,
  currentPreString,
  currentPreExtendString,
  joinString,
  initPad,
  currentColor,
  error = "look like not file or dir"
) {
  let currentTemp = "xxxxxxxxxx ";
  currentTemp += currentPreString + joinString + currentFileName;
  if (currentTemp.length > initPad) {
    if (initPad < 3) {
      currentTemp = ".".repeat(initPad);
    } else {
      currentTemp = currentTemp.slice(0, initPad - 3) + "...";
    }
  }
  currentTemp = currentTemp.padEnd(initPad);
  currentTemp += currentPreExtendString + joinString;
  if (currentColor) {
    currentTemp = chalk.hex(currentColor).bold(currentTemp);
  }
  currentTemp += chalk.red(`${error}\n`);
  lastRe += currentTemp;
  return lastRe;
}

exports.getFileRowBase = getFileRowBase;

exports.catchErrorRowBase = catchErrorRowBase;

exports.getFileRowExtend = getFileRowExtend;

exports.catchErrorRowExtend = catchErrorRowExtend;
