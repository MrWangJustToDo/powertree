const path = require("path");
const chalk = require("chalk");
const process = require("process");
const { getRandomColor, fileStat } = require("./tools");
const {
  getAllFileBase,
  getAllFileBaseColorful,
  getAllFileExtend,
} = require("./getAllFile");

function listFiles(colorFlag, extend, dir, initPad = 65) {
  let temp = initPad;
  if (!isNaN(dir)) {
    initPad = dir;
    if (!isNaN(temp)) {
      dir = ".";
    } else {
      dir = temp;
    }
  }
  initPad = Number(initPad);
  dir = path.resolve(dir);
  // 当前文件夹全路径
  let currentPath = dir;
  // 当前文件夹名称
  let currentName = path.basename(dir);
  return fileStat(dir)
    .then((file) => {
      if (file.isDirectory()) {
        if (extend) {
          return getAllFileExtend(
            "\n",
            currentPath,
            currentName,
            " ",
            " ",
            true,
            process.platform === "linux",
            initPad,
            colorFlag ? getRandomColor() : undefined,
            {}
          );
        } else {
          if (colorFlag) {
            return getAllFileBaseColorful(
              ".\n",
              currentPath,
              currentName,
              " ",
              true
            );
          } else {
            return getAllFileBase(".\n", currentPath, currentName, " ", true);
          }
        }
      } else {
        return chalk.red("Path Must Be A Dir");
      }
    })
    .then((temp) => {
      return temp;
    })
    .catch((e) => {
      return chalk.red("Path Not Exist Or Permission Denied");
    });
}

exports.listFiles = listFiles;
