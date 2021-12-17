const path = require("path");
const chalk = require("chalk");
const process = require("process");
const {
  getRandomColor,
  fileStat,
  flushItem,
  clearTerminal,
} = require("./tools");
const { getAllFileBase } = require("./getAllFileBase");
const { getAllFileExtendAsync } = require("./getAllFileAsync");

/**
 * 入口函数
 * @param {Boolean} colorFlag -c 颜色模式
 * @param {Boolean} extend -e 扩展模式
 * @param {String} dir 当前遍历文件夹
 * @param {Number} initPad 扩展模式下的两列内容的间距
 * @returns {Promise}
 */
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
  const currentPath = dir;
  // 当前文件夹名称
  const currentName = path.basename(dir);
  return fileStat(dir)
    .then((file) => {
      if (file.isDirectory()) {
        // 扩展显示模式，使用递归
        console.time("search ~~");
        if (extend) {
          return getAllFileExtendAsync(
            currentPath,
            currentName,
            " ",
            " ",
            true,
            process.platform === "linux",
            initPad,
            colorFlag ? getRandomColor() : undefined,
            {}
          )
            .then((all) => {
              flushItem(currentName);
              clearTerminal();
              console.timeEnd("search ~~");
              return all;
            })
            .then(console.log);
        } else {
          // 普通显示模式，获取到的数据直接输出
          console.log(".");
          return getAllFileBase(
            currentPath,
            currentName,
            " ",
            !!colorFlag,
            true
          ).then(() => console.timeEnd("search ~~"));
        }
      } else {
        console.log(chalk.red("--Input Path Must be a Dir--"));
      }
    })
    .catch(() =>
      console.log(chalk.red("--Path Not Exist or Permission Denied--"))
    );
}

exports.listFiles = listFiles;
