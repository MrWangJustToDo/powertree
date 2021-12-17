const path = require("path");
const chalk = require("chalk");
const prettyBytes = require("pretty-bytes");

const {
  fileStat,
  getChmod,
  execFileJudge,
  flushItem,
  dirPathProgress,
} = require("./tools");

function getFileRowExtendAsync(
  currentDirPath,
  currentFileName,
  currentPreString,
  currentPreExtendString,
  joinString,
  initPad,
  currentColor
) {
  dirPathProgress.current++;
  flushItem(currentFileName);
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
      return { currentTemp, size: fileState.size };
    }
  );
}

function catchErrorRowExtendAsync(
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
  return currentTemp;
}

exports.getFileRowExtendAsync = getFileRowExtendAsync;
exports.catchErrorRowExtendAsync = catchErrorRowExtendAsync;
