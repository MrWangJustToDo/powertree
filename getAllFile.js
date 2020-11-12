const path = require("path");
const chalk = require("chalk");
const prettyBytes = require("pretty-bytes");

const { getDirRowBase, getDirRowEx } = require("./getDirItem");
const {
  getFileRowBase,
  getFileRowBaseColorful,
  getFileRowExtend,
} = require("./getFileItem");
const { readDir, getRandomColor } = require("./tools");

/**
 * 按照基础命令输出信息
 * @param {String} lastRe 已经执行输出的数据
 * @param {String} currentDirPath 当前文件夹全路径
 * @param {String} currentDirName 当前文件夹名称
 * @param {String} currentPreString 当前路径层级的连接字符串
 * @param {String} isLast 当前文件夹是否是当前层级的最后一个
 */
function getAllFileBase(
  lastRe,
  currentDirPath,
  currentDirName,
  currentPreString,
  isLast
) {
  return new Promise((resolve) => {
    // 添加当前文件夹信息
    getDirRowBase(
      lastRe,
      currentPreString.slice(0, -1),
      isLast ? "└── " : "├── ",
      currentDirName,
      false
    ).then(resolve);
  }).then((lastReAddCurrentDir) =>
    // 遍历当前文件夹中所有内容
    readDir(currentDirPath, { withFileTypes: true })
      .then((currentDirArr) => {
        var temp = [];
        for (let i = 0; i < currentDirArr.length; i++) {
          // 如果目标是一个文件，按照文件的规则进行处理
          if (currentDirArr[i].isFile()) {
            temp.push((currentRe) =>
              getFileRowBase(
                currentRe,
                currentPreString,
                i === currentDirArr.length - 1
                  ? "└── ".padStart(7)
                  : "├── ".padStart(7),
                currentDirArr[i].name
              )
            );
          } else if (currentDirArr[i].isDirectory()) {
            // 如果是文件夹，再使用当前规则处理，此时的相应参数会改变
            temp.push((currentRe) =>
              getAllFileBase(
                currentRe,
                path.join(currentDirPath, currentDirArr[i].name),
                currentDirArr[i].name,
                i === currentDirArr.length - 1
                  ? currentPreString + " ".padStart(4)
                  : currentPreString + "│".padStart(4),
                i === currentDirArr.length - 1
              )
            );
          }
        }
        // 全部任务放入数组中，为了保证按照顺序执行，使用promise特性与数组的reduce实现
        return temp.reduce(
          (pre, current) => pre.then((lastAdd) => current(lastAdd)),
          Promise.resolve(lastReAddCurrentDir)
        );
      })
      .catch((e) => {
        // console.log(e);s
        return lastReAddCurrentDir + currentPreString +
          "└── ".padStart(7) + chalk.red("it look like something wrong\n");
      })
  );
}

// 基础命令的彩色输出
function getAllFileBaseColorful(
  lastRe,
  currentDirPath,
  currentDirName,
  currentPreString,
  isLast
) {
  return new Promise((resolve) => {
    getDirRowBase(
      lastRe,
      currentPreString.slice(0, -1),
      isLast ? "└── " : "├── ",
      currentDirName,
      true
    ).then(resolve);
  }).then((lastReAddCurrentDir) =>
    readDir(currentDirPath, { withFileTypes: true })
      .then((currentDirArr) => {
        var temp = [];
        for (let i = 0; i < currentDirArr.length; i++) {
          // 如果目标是一个文件，按照文件的规则进行处理
          if (currentDirArr[i].isFile()) {
            temp.push((currentRe) =>
              getFileRowBaseColorful(
                currentRe,
                currentPreString,
                i === currentDirArr.length - 1
                  ? "└── ".padStart(7)
                  : "├── ".padStart(7),
                currentDirArr[i].name,
                currentDirPath
              )
            );
          } else if (currentDirArr[i].isDirectory()) {
            // 如果是文件夹，再使用当前规则处理，此时的相应参数会改变
            temp.push((currentRe) =>
              getAllFileBaseColorful(
                currentRe,
                path.join(currentDirPath, currentDirArr[i].name),
                currentDirArr[i].name,
                i === currentDirArr.length - 1
                  ? currentPreString + " ".padStart(4)
                  : currentPreString + "│".padStart(4),
                i === currentDirArr.length - 1
              )
            );
          }
        }
        return temp.reduce(
          (pre, current) => pre.then((lastAdd) => current(lastAdd)),
          Promise.resolve(lastReAddCurrentDir)
        );
      })
      .catch((e) => {
        return lastReAddCurrentDir + currentPreString +
          "└── ".padStart(7) + chalk.red("it look like something wrong\n");
      })
  );
}

// 带有扩展选项的显示
function getAllFileExtend(
  lastRe,
  currentDirPath,
  currentDirName,
  currentPreString,
  currentPreExtendString,
  isLast,
  unixModule,
  initPad,
  currentColor,
  dirSizeMap
) {
  return new Promise((resolve) => {
    getDirRowEx(
      lastRe,
      currentDirPath,
      currentDirName,
      currentPreString.slice(0, -1),
      currentPreExtendString.slice(0, -1),
      isLast ? "└── " : "├── ",
      initPad,
      currentColor,
      unixModule
    ).then(resolve);
  }).then((lastReAddCurrentDir) =>
    readDir(currentDirPath, { withFileTypes: true })
      .then((currentDirArr) => {
        let temp = [];
        let currentDirSize = 0;
        for (let i = 0; i < currentDirArr.length; i++) {
          if (currentDirArr[i].isFile()) {
            temp.push((currentRe) =>
              getFileRowExtend(
                currentRe,
                currentDirPath,
                currentDirArr[i].name,
                currentPreString,
                currentPreExtendString,
                i === currentDirArr.length - 1
                  ? "└── ".padStart(7)
                  : "├── ".padStart(7),
                initPad,
                currentColor
              ).then(({ lastRe, size }) => {
                // 统计当前文件夹下文件的大小
                currentDirSize += size;
                return lastRe;
              })
            );
          } else if (currentDirArr[i].isDirectory()) {
            temp.push((currentRe) =>
              getAllFileExtend(
                currentRe,
                path.join(currentDirPath, currentDirArr[i].name),
                currentDirArr[i].name,
                i !== currentDirArr.length - 1
                  ? currentPreString + "│".padStart(4)
                  : currentPreString + " ".padStart(4),
                i !== currentDirArr.length - 1
                  ? currentPreExtendString + "│".padStart(4)
                  : currentPreExtendString + " ".padStart(4),
                i === currentDirArr.length - 1,
                unixModule,
                initPad,
                currentColor ? getRandomColor() : undefined,
                dirSizeMap
              ).then((lastRe) => {
                // 统计当前文件夹下文件夹的大小
                currentDirSize +=
                  dirSizeMap[path.join(currentDirPath, currentDirArr[i].name)];
                return lastRe;
              })
            );
          }
        }
        return temp
          .reduce(
            (pre, current) => pre.then((lastAdd) => current(lastAdd)),
            Promise.resolve(lastReAddCurrentDir)
          )
          .then((lastRe) => {
            dirSizeMap[currentDirPath] = currentDirSize;
            // 得到结果，替换当前文件夹大小的占位符
            let index = lastRe.lastIndexOf(
              "&&--size-placeHolder-by-powerTree--&&"
            );
            return (
              lastRe.slice(0, index) +
              prettyBytes(currentDirSize) +
              lastRe.slice(index + 37)
            );
          });
      })
      .catch((e) => {
        return lastReAddCurrentDir + currentPreString +
          "└── ".padStart(7) + chalk.red("it look like something wrong\n");
      })
  );
}

exports.getAllFileBase = getAllFileBase;
exports.getAllFileBaseColorful = getAllFileBaseColorful;
exports.getAllFileExtend = getAllFileExtend;
