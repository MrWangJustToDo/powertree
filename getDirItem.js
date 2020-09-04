const prettyBytes = require("pretty-bytes");
const chalk = require("chalk");
const { getColor } = require("./getCurrentColor");
const { fileStat, getChmod, transformUidToUser } = require("./tools");

function getDirRowBase(temp, lastPath, nextPrePath, joinString, colorful) {
  return new Promise((resolve) => {
    temp += nextPrePath + joinString;
    if (colorful) {
      temp += chalk.bgHex(getColor("", true, false)).bold(lastPath);
    } else {
      temp += lastPath;
    }
    resolve(temp + "\n");
  });
}

function getDirRow(
  temp,
  currentPath,
  lastPath,
  nextPrePath,
  nextPreExtendPath,
  initPad,
  joinString,
  size,
  currentColor
) {
  return fileStat(currentPath).then((file) => {
    let currentTemp = "";
    currentTemp += `d${getChmod(file.mode)}`;
    currentTemp += nextPrePath + joinString + lastPath;
    currentTemp = currentTemp.padEnd(initPad);
    currentTemp += nextPreExtendPath + joinString + prettyBytes(size);
    currentTemp = currentTemp.padEnd(10);
    if (currentColor) {
      currentTemp = chalk.hex(currentColor).bold(currentTemp);
    }
    temp += currentTemp + "\n";
    return temp;
  });
}

function getDirRowUnix(
  temp,
  currentPath,
  lastPath,
  nextPrePath,
  nextPreExtendPath,
  initPad,
  joinString,
  size,
  currentColor
) {
  let currentTemp = "";
  return fileStat(currentPath)
    .then((file) => {
      currentTemp += `d${getChmod(file.mode)}`;
      currentTemp += nextPrePath + joinString + lastPath;
      currentTemp = currentTemp.padEnd(initPad);
      currentTemp += nextPreExtendPath + joinString + prettyBytes(size);
      currentTemp = currentTemp.padEnd(10);
      return file.uid;
    })
    .then(transformUidToUser)
    .then((name) => {
      currentTemp += `  user: ${name}\n`;
      if (currentColor) {
        temp += chalk.hex(currentColor).bold(currentTemp);
      } else {
        temp += currentTemp;
      }
      return temp;
    });
}

exports.getDirRowBase = getDirRowBase;
exports.getDirRow = getDirRow;
exports.getDirRowUnix = getDirRowUnix;