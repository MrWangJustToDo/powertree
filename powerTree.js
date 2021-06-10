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
        // 扩展显示模式，使用递归
        if (extend) {
          return getAllFileExtend(
            "\n",
            currentPath,
            currentName,
            " ",
            " ",
            true,
            false && process.platform === "linux",
            initPad,
            colorFlag ? getRandomColor() : undefined,
            {}
          );
        } else {
          // 普通显示模式，获取到的数据直接输出
          console.log(".");
          if (colorFlag) {
            return getAllFileBaseColorful(currentPath, currentName, " ", true);
          } else {
            return getAllFileBase(currentPath, currentName, " ", true);
          }
        }
      } else {
        console.log(chalk.red("--Path Must Be A Dir--"));
      }
    })
    .catch((e) =>
      console.log(chalk.red("--Path Not Exist Or Permission Denied--"))
    );
}

exports.listFiles = listFiles;
