const prettyBytes = require("pretty-bytes");
const chalk = require("chalk");
const path = require("path");
const { getColor } = require("./getCurrentColor");
const { fileStat, getChmod, execFileJudge } = require("./tools");

function getFileRowBase(temp, filePath, nextPrePath, joinString) {
  return new Promise((resolve) => {
    temp += nextPrePath + joinString + filePath;
    resolve(temp + "\n");
  });
}

function getFileRowBaseColorful(
  temp,
  filePath,
  dirPath,
  nextPrePath,
  joinString
) {
  return fileStat(path.join(dirPath, filePath)).then((file) => {
    let currentTemp = nextPrePath + joinString;
    let mod = getChmod(file.mode);
    let flag = execFileJudge(mod);
    if (flag) {
      currentTemp += chalk
        .hex(getColor(filePath, false, true))
        .bold(filePath + "*");
    } else {
      currentTemp += chalk.hex(getColor(filePath, false, false)).bold(filePath);
    }
    temp += currentTemp;
    return temp + "\n";
  });
}

function getFileRowExtend(
  temp,
  dirPath,
  filePath,
  nextPrePath,
  nextPreExtendPath,
  initPad,
  joinString,
  currentColor
) {
  return fileStat(path.join(dirPath, filePath)).then((file) => {
    let currentTemp = "-";
    let mod = getChmod(file.mode);
    currentTemp += mod;
    let flag = execFileJudge(mod);
    if (currentColor && flag) {
      currentTemp += " " + nextPrePath + joinString + filePath + "*";
    } else {
      currentTemp += " " + nextPrePath + joinString + filePath;
    }
    currentTemp = currentTemp.padEnd(initPad);
    currentTemp +=
      nextPreExtendPath + joinString + prettyBytes(file.size).padEnd(10);
    currentTemp += `mtime: ${new Date(file.mtime).toLocaleDateString()}\n`;
    if (currentColor) {
      currentTemp = chalk.hex(currentColor).bold(currentTemp);
    }
    temp += currentTemp;
    return temp;
  });
}

exports.getFileRowBase = getFileRowBase;
exports.getFileRowBaseColorful = getFileRowBaseColorful;
exports.getFileRowExtend = getFileRowExtend;
