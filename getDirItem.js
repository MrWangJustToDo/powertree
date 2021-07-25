const chalk = require("chalk");

const { ignoreList } = require("./ignoreList");
const { readDir, fileStat, getChmod, transformUidToUser } = require("./tools");

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

/**
 *
 * @param {String} lastRe 递归获取的之前所有的数据
 * @param {String} currentDirPath 当前文件夹的绝对路径
 * @param {String} currentDirName 当前文件夹名称
 * @param {String} currentPreString 当前层级的第一列连接前缀字符串
 * @param {String} currentPreExtendString 当前层级的第二列连接前缀字符串
 * @param {String} joinString 当前层级的连接字符串
 * @param {String} initPad 两列数据的间隙
 * @param {String} currentColor 当前需要的显示颜色
 * @param {Boolean} isUnixMod 当前系统
 * @returns
 */
function getDirRowEx(
  lastRe,
  currentDirPath,
  currentDirName,
  currentPreString,
  currentPreExtendString,
  joinString,
  initPad,
  currentColor,
  isUnixMod
) {
  return readDir(currentDirPath, { withFileTypes: true }).then(
    (currentDirItemArr) => {
      if (isUnixMod) {
        return getDirRowUnix(
          lastRe,
          currentDirPath,
          currentDirName,
          currentPreString,
          currentPreExtendString,
          joinString,
          initPad,
          currentColor
        ).then((lastRe) => ({
          currentDirItemArr,
          lastRe,
        }));
      } else {
        return getDirRowWindows(
          lastRe,
          currentDirPath,
          currentDirName,
          currentPreString,
          currentPreExtendString,
          joinString,
          initPad,
          currentColor
        ).then((lastRe) => ({
          currentDirItemArr,
          lastRe,
        }));
      }
    }
  );
}

function getDirRowWindows(
  lastRe,
  currentDirPath,
  currentDirName,
  currentPreString,
  currentPreExtendString,
  joinString,
  initPad,
  currentColor
) {
  process.stdout.cursorTo(0);
  process.stdout.write(currentDirPath + currentDirName);
  return fileStat(currentDirPath).then((fileState) => {
    let currentTemp = `d${getChmod(fileState.mode)} `;
    currentTemp += currentPreString + joinString + currentDirName;
    if (currentTemp.length > initPad) {
      // 超出显示优化
      currentTemp = currentTemp.slice(0, initPad - 3) + "...";
    }
    currentTemp = currentTemp.padEnd(initPad);
    currentTemp +=
      currentPreExtendString +
      joinString +
      "&&--size-placeHolder-by-powerTree--&&";
    currentTemp = currentTemp.padEnd(10);
    if (currentColor) {
      currentTemp = chalk.hex(currentColor).bold(currentTemp);
    }
    lastRe += currentTemp + "\n";
    return lastRe;
  });
}

function getDirRowUnix(
  lastRe,
  currentDirPath,
  currentDirName,
  currentPreString,
  currentPreExtendString,
  joinString,
  initPad,
  currentColor
) {
  let currentTemp = "";
  process.stdout.cursorTo(0);
  process.stdout.write(currentDirPath + currentDirName);
  return fileStat(currentDirPath)
    .then((fileState) => {
      currentTemp += `d${getChmod(fileState.mode)} `;
      currentTemp += currentPreString + joinString + currentDirName;
      if (currentTemp.length > initPad) {
        // 超出显示优化
        currentTemp = currentTemp.slice(0, initPad - 3) + "...";
      }
      currentTemp = currentTemp.padEnd(initPad);
      // 使用占位符标记需要统计大小的地方，在当前层级的后续循环中进行填补
      currentTemp +=
        currentPreExtendString +
        joinString +
        "&&--size-placeHolder-by-powerTree--&&";
      currentTemp = currentTemp.padEnd(10);
      return { uid: fileState.uid, currentColor };
    })
    .then(transformUidToUser)
    .then((name) => {
      currentTemp += `  user: ${name}`;
      if (currentColor) {
        currentTemp = chalk.hex(currentColor).bold(currentTemp);
      }
      lastRe += currentTemp + "\n";
      return lastRe;
    });
}

exports.getDirRowBase = getDirRowBase;
exports.getDirRowEx = getDirRowEx;
