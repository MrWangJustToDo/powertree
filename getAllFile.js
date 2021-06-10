const path = require("path");
const chalk = require("chalk");
const prettyBytes = require("pretty-bytes");

const { readDir, getRandomColor } = require("./tools");
const { getDirRowBase, getDirRowEx } = require("./getDirItem");
const {
  getFileRowBase,
  getFileRowBaseColorful,
  getFileRowExtend,
  catchErrorRowExtend,
} = require("./getFileItem");

/**
 * 按照基础命令输出信息
 * @param {String} currentDirPath 当前文件夹全路径
 * @param {String} currentDirName 当前文件夹名称
 * @param {String} currentPreString 当前路径层级的连接字符串
 * @param {String} isLast 当前文件夹是否是当前层级的最后一个
 */
function getAllFileBase(
  currentDirPath,
  currentDirName,
  currentPreString,
  isLast
) {
  // 添加当前文件夹信息
  return getDirRowBase(
    currentPreString.slice(0, -1),
    isLast ? "└── " : "├── ",
    currentDirName,
    false
  )
    .then(() =>
      // 遍历当前文件夹中所有内容
      readDir(currentDirPath, { withFileTypes: true })
        .then((currentDirArr) => {
          var temp = [];
          for (let i = 0; i < currentDirArr.length; i++) {
            // 如果目标是一个文件，按照文件的规则进行处理
            if (currentDirArr[i].isFile()) {
              temp.push(() =>
                getFileRowBase(
                  currentPreString,
                  i === currentDirArr.length - 1
                    ? "└── ".padStart(7)
                    : "├── ".padStart(7),
                  currentDirArr[i].name
                )
              );
            } else if (currentDirArr[i].isDirectory()) {
              // 如果是文件夹，再使用当前规则处理，此时的相应参数会改变
              temp.push(() =>
                getAllFileBase(
                  path.join(currentDirPath, currentDirArr[i].name),
                  currentDirArr[i].name,
                  i === currentDirArr.length - 1
                    ? currentPreString + " ".padStart(4)
                    : currentPreString + "│".padStart(4),
                  i === currentDirArr.length - 1
                )
              );
            } else {
              temp.push(() =>
                Promise.resolve(
                  console.log(
                    currentPreString +
                      (i === currentDirArr.length - 1
                        ? "└── ".padStart(7)
                        : "├── ".padStart(7)) +
                      chalk.red("look like not file or dir")
                  )
                )
              );
            }
          }
          // 全部任务放入数组中，为了保证按照顺序执行，使用promise特性与数组的reduce实现
          return temp.reduce(
            (pre, current) => pre.then(current),
            Promise.resolve()
          );
        })
        .catch(() => {
          console.log(
            lastReAddCurrentDir +
              currentPreString +
              "└── ".padStart(7) +
              chalk.red("look like something wrong")
          );
        })
    )
    .catch((e) => {
      if (e === -1) {
        console.log(
          currentPreString +
            "└── ".padStart(7) +
            chalk.green("ignore current dir")
        );
      } else {
        console.log(
          currentPreString.slice(0, -1) +
            (isLast ? "└── " : "├── ") +
            chalk.red("look like something wrong")
        );
      }
    });
}

// 基础命令的彩色输出
function getAllFileBaseColorful(
  currentDirPath,
  currentDirName,
  currentPreString,
  isLast
) {
  return getDirRowBase(
    currentPreString.slice(0, -1),
    isLast ? "└── " : "├── ",
    currentDirName,
    true
  )
    .then(() =>
      readDir(currentDirPath, { withFileTypes: true })
        .then((currentDirArr) => {
          var temp = [];
          for (let i = 0; i < currentDirArr.length; i++) {
            // 如果目标是一个文件，按照文件的规则进行处理
            if (currentDirArr[i].isFile()) {
              temp.push(() =>
                getFileRowBaseColorful(
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
              temp.push(() =>
                getAllFileBaseColorful(
                  path.join(currentDirPath, currentDirArr[i].name),
                  currentDirArr[i].name,
                  i === currentDirArr.length - 1
                    ? currentPreString + " ".padStart(4)
                    : currentPreString + "│".padStart(4),
                  i === currentDirArr.length - 1
                )
              );
            } else {
              temp.push(() =>
                Promise.resolve(
                  console.log(
                    currentPreString +
                      (i === currentDirArr.length - 1
                        ? "└── ".padStart(7)
                        : "├── ".padStart(7)) +
                      chalk.red("look like not file or dir")
                  )
                )
              );
            }
          }
          return temp.reduce(
            (pre, current) => pre.then(current),
            Promise.resolve()
          );
        })
        .catch(() => {
          console.log(
            lastReAddCurrentDir +
              currentPreString +
              "└── ".padStart(7) +
              chalk.red("look like something wrong")
          );
        })
    )
    .catch((e) => {
      if (e === -1) {
        console.log(
          currentPreString +
            "└── ".padStart(7) +
            chalk.green("ignore current dir")
        );
      } else {
        console.log(
          currentPreString.slice(0, -1) +
            (isLast ? "└── " : "├── ") +
            chalk.red("look like something wrong")
        );
      }
    });
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
  let currentDirSize = 0;
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
                  dirSizeMap[
                    path.join(currentDirPath, currentDirArr[i].name)
                  ] || 0;
                return lastRe;
              })
            );
          } else {
            temp.push((currentRe) =>
              catchErrorRowExtend(
                currentRe,
                currentDirArr[i].name,
                currentPreString,
                currentPreExtendString,
                i === currentDirArr.length - 1
                  ? "└── ".padStart(7)
                  : "├── ".padStart(7),
                initPad,
                currentColor
              )
            );
          }
        }
        return temp.reduce(
          (pre, current) => pre.then((lastAdd) => current(lastAdd)),
          Promise.resolve(lastReAddCurrentDir)
        );
      })
      .catch(() =>
        catchErrorRowExtend(
          lastReAddCurrentDir,
          currentDirName,
          currentPreString.slice(0, -1),
          currentPreExtendString.slice(0, -1),
          isLast ? "└── " : "├── ",
          initPad,
          currentColor,
          "look like something wrong"
        )
      )
      .then((lastRe) => {
        dirSizeMap[currentDirPath] = currentDirSize;
        // 得到结果，替换当前文件夹大小的占位符
        let index = lastRe.lastIndexOf("&&--size-placeHolder-by-powerTree--&&");
        return (
          lastRe.slice(0, index) +
          prettyBytes(currentDirSize) +
          lastRe.slice(index + 37)
        );
      })
  );
}

exports.getAllFileBase = getAllFileBase;
exports.getAllFileBaseColorful = getAllFileBaseColorful;
exports.getAllFileExtend = getAllFileExtend;
