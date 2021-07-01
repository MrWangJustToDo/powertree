const path = require("path");
const prettyBytes = require("pretty-bytes");

const { getRandomColor } = require("./tools");
const { getDirRowBase, getDirRowEx } = require("./getDirItem");
const {
  getFileRowBase,
  catchErrorRowBase,
  getFileRowExtend,
  catchErrorRowExtend,
} = require("./getFileItem");

/**
 * 按照基础命令输出信息
 * @param {String} currentDirPath 当前文件夹全路径
 * @param {String} currentDirName 当前文件夹名称
 * @param {String} currentPreString 当前路径层级的连接字符串
 * @param {Boolean} colorful 当前是否是颜色模式
 * @param {String} isLast 当前文件夹是否是当前层级的最后一个
 * @param {number}  当前文件夹是否是当前层级的最后一个
 */
function getAllFileBase(
  currentDirPath,
  currentDirName,
  currentPreString,
  colorful,
  isLast
) {
  // 添加当前文件夹信息
  return (
    getDirRowBase(
      currentDirPath,
      currentDirName,
      currentPreString.slice(0, -1),
      isLast ? "└── " : "├── ",
      colorful
    )
      // 遍历当前文件夹中所有内容
      .then((currentDirItemArr) => {
        const temp = [];
        for (let i = 0; i < currentDirItemArr.length; i++) {
          // 如果目标是一个文件，按照文件的规则进行处理
          if (currentDirItemArr[i].isFile()) {
            temp.push(() =>
              getFileRowBase(
                currentDirPath,
                currentDirItemArr[i].name,
                currentPreString,
                colorful,
                i === currentDirItemArr.length - 1
                  ? "└── ".padStart(7)
                  : "├── ".padStart(7)
              )
            );
          } else if (currentDirItemArr[i].isDirectory()) {
            // 如果是文件夹，再使用当前规则处理，此时的相应参数会改变
            temp.push(() =>
              getAllFileBase(
                path.join(currentDirPath, currentDirItemArr[i].name),
                currentDirItemArr[i].name,
                i === currentDirItemArr.length - 1
                  ? currentPreString + " ".padStart(4)
                  : currentPreString + "│".padStart(4),
                colorful,
                i === currentDirItemArr.length - 1
              )
            );
          } else {
            temp.push(() =>
              catchErrorRowBase(
                path.join(currentDirPath, currentDirItemArr[i].name),
                currentPreString,
                i === currentDirItemArr.length - 1
                  ? "└── ".padStart(7)
                  : "├── ".padStart(7)
              )
            );
          }
        }
        return temp.reduce(
          (pre, current) => pre.then(current),
          Promise.resolve()
        );
      })
      .catch((e) => {
        if (e === -1) {
          catchErrorRowBase(
            currentDirName,
            currentPreString,
            "└── ".padStart(7),
            "ignore current dir"
          );
        } else {
          catchErrorRowBase(
            currentDirPath,
            currentPreString.slice(0, -1),
            isLast ? "└── " : "├── ",
            "can not open dir"
          );
        }
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
  dirSizeMap,
  isFirst
) {
  let currentDirSize = 0;
  let timmerId;
  return getDirRowEx(
    lastRe,
    currentDirPath,
    currentDirName,
    currentPreString.slice(0, -1),
    currentPreExtendString.slice(0, -1),
    isLast ? "└── " : "├── ",
    initPad,
    currentColor,
    unixModule
  )
    .then(({ lastRe, currentDirItemArr }) => {
      const temp = [];
      for (let i = 0; i < currentDirItemArr.length; i++) {
        if (currentDirItemArr[i].isFile()) {
          temp.push((currentRe) =>
            getFileRowExtend(
              currentRe,
              currentDirPath,
              currentDirItemArr[i].name,
              currentPreString,
              currentPreExtendString,
              i === currentDirItemArr.length - 1
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
        } else if (currentDirItemArr[i].isDirectory()) {
          temp.push((currentRe) =>
            getAllFileExtend(
              currentRe,
              path.join(currentDirPath, currentDirItemArr[i].name),
              currentDirItemArr[i].name,
              i !== currentDirItemArr.length - 1
                ? currentPreString + "│".padStart(4)
                : currentPreString + " ".padStart(4),
              i !== currentDirItemArr.length - 1
                ? currentPreExtendString + "│".padStart(4)
                : currentPreExtendString + " ".padStart(4),
              i === currentDirItemArr.length - 1,
              unixModule,
              initPad,
              currentColor ? getRandomColor() : undefined,
              dirSizeMap
            ).then((lastRe) => {
              // 统计当前文件夹下文件夹的大小
              currentDirSize +=
                dirSizeMap[
                  path.join(currentDirPath, currentDirItemArr[i].name)
                ] || 0;
              return lastRe;
            })
          );
        } else {
          temp.push((currentRe) =>
            catchErrorRowExtend(
              currentRe,
              currentDirItemArr[i].name,
              currentPreString,
              currentPreExtendString,
              i === currentDirItemArr.length - 1
                ? "└── ".padStart(7)
                : "├── ".padStart(7),
              initPad,
              currentColor
            )
          );
        }
      }
      if (isFirst) {
        const allLength = temp.length - 1;
        return temp
          .reduce(
            (pre, current, i) =>
              pre
                .then((lastAdd) => current(lastAdd))
                .then((lastAdd) => {
                  clearTimeout(timmerId);
                  if (i === allLength) {
                    timmerId = setTimeout(() => {
                      process.stdout.write("100%\n");
                    }, 100);
                  } else {
                    timmerId = setTimeout(() => {
                      process.stdout.write(
                        parseInt((i * 100) / allLength) + "% "
                      );
                    }, 100);
                  }
                  return lastAdd;
                }),
            Promise.resolve(lastRe)
          )
          .then((re) => (clearTimeout(timmerId), re));
      } else {
        return temp.reduce(
          (pre, current) => pre.then((lastAdd) => current(lastAdd)),
          Promise.resolve(lastRe)
        );
      }
    })
    .catch(() => {
      return catchErrorRowExtend(
        lastRe,
        currentDirName,
        currentPreString.slice(0, -1),
        currentPreExtendString.slice(0, -1),
        isLast ? "└── " : "├── ",
        initPad,
        currentColor,
        "can not open current dir"
      );
    })
    .then((lastRe) => {
      dirSizeMap[currentDirPath] = currentDirSize;
      // 得到结果，替换当前文件夹大小的占位符
      const index = lastRe.lastIndexOf("&&--size-placeHolder-by-powerTree--&&");
      if (index !== -1) {
        return (
          lastRe.slice(0, index) +
          prettyBytes(currentDirSize) +
          lastRe.slice(index + 37)
        );
      } else {
        return lastRe;
      }
    });
}

exports.getAllFileBase = getAllFileBase;
exports.getAllFileExtend = getAllFileExtend;
