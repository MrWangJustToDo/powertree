const chalk = require("chalk");

const {
  readDir,
  fileStat,
  getChmod,
  transformUidToUser,
  flushItem,
  dirPathProgress,
} = require("./tools");

/**
 *
 * @param {string} currentDirPath 当前文件夹的绝对路径
 * @param {string} currentDirName 当前文件夹名称
 * @param {string} currentPreString 当前层级的第一列连接前缀字符串
 * @param {string} currentPreExtendString 当前层级的第二列连接前缀字符串
 * @param {string} joinString 当前层级的连接字符串
 * @param {string} initPad 两列数据的间隙
 * @param {string} currentColor 当前需要的显示颜色
 * @param {boolean} isUnixMod 当前系统
 */
function getDirRowExAsync(
  currentDirPath,
  currentDirName,
  currentPreString,
  currentPreExtendString,
  joinString,
  initPad,
  currentColor,
  isUnixMod
) {
  return Promise.all([
    readDir(currentDirPath, { withFileTypes: true }).then((dirItemArr) => {
      dirPathProgress.all += dirItemArr.length;
      dirPathProgress.current++;
      flushItem(currentDirName);
      return dirItemArr;
    }),
    isUnixMod
      ? getDirRowUnixAsync(
          currentDirPath,
          currentDirName,
          currentPreString,
          currentPreExtendString,
          joinString,
          initPad,
          currentColor
        )
      : getDirRowWindowsAsync(
          currentDirPath,
          currentDirName,
          currentPreString,
          currentPreExtendString,
          joinString,
          initPad,
          currentColor
        ),
  ]);
}

function getDirRowUnixAsync(
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
      const mod = `d${getChmod(fileState.mode)} `;
      currentTemp += mod;

      currentTemp += currentPreString + joinString + currentDirName;

      if (currentTemp.length > initPad) {
        if (initPad < 3) {
          currentTemp = ".".repeat(initPad);
        } else {
          // 超出显示优化
          currentTemp = currentTemp.slice(0, initPad - 3) + "...";
        }
      }
      currentTemp = currentTemp.padEnd(initPad);
      // 使用占位符标记需要统计大小的地方，在当前层级的后续循环中进行填补
      currentTemp +=
        currentPreExtendString +
        joinString +
        "&&--size-placeHolder-by-powerTree--&&";
      return { uid: fileState.uid, currentColor };
    })
    .then(transformUidToUser)
    .then((name) => {
      currentTemp += `  user: ${name}`;
      if (currentColor) {
        currentTemp = chalk.hex(currentColor).bold(currentTemp);
      }
      currentTemp += "\n";
      return currentTemp;
    });
}

function getDirRowWindowsAsync(
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
      if (initPad < 3) {
        currentTemp = ".".repeat(initPad);
      } else {
        // 超出显示优化
        currentTemp = currentTemp.slice(0, initPad - 3) + "...";
      }
    }
    currentTemp = currentTemp.padEnd(initPad);

    currentTemp +=
      currentPreExtendString +
      joinString +
      "&&--size-placeHolder-by-powerTree--&&";

    if (currentColor) {
      currentTemp = chalk.hex(currentColor).bold(currentTemp);
    }

    return currentTemp + "\n";
  });
}

exports.getDirRowExAsync = getDirRowExAsync;
