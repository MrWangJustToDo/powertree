const chalk = require("chalk");

const { ignoreList } = require("./ignoreList");
const { fileStat, getChmod, transformUidToUser } = require("./tools");

/**
 * 普通模式输出
 * @param {String} currentPreString 当前待连接的前缀 如 |  |  |, 注意传入时需要slice(0, -1), 因为会和下面的joinString进行拼接
 * @param {String} joinString 当前需要连接的字符串 如 |--
 * @param {String} currentDirName 当前文件夹名称
 * @param {Boolean} colorful 是否是彩色显示模式
 */
function getDirRowBase(currentPreString, joinString, currentDirName, colorful) {
  return new Promise((resolve, reject) => {
    let current = currentPreString + joinString;
    if (colorful) {
      current += chalk.blue(currentDirName);
    } else {
      current += currentDirName;
    }
    console.log(current);
    if (ignoreList[currentDirName]) {
      reject(-1);
    } else {
      resolve();
    }
  });
}

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
    );
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
    );
  }
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
      currentTemp += `  user: ${name}\n`;
      if (currentColor) {
        lastRe += chalk.hex(currentColor).bold(currentTemp);
      } else {
        lastRe += currentTemp;
      }
      return lastRe;
    });
}

exports.getDirRowBase = getDirRowBase;
exports.getDirRowEx = getDirRowEx;
