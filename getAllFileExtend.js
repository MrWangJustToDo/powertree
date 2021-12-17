const path = require("path");
const prettyBytes = require("pretty-bytes");

const { getRandomColor } = require("./tools");
const { ignoreList } = require("./ignoreList");
const { getDirRowEx } = require("./getDirItemExtend");
const {
  getFileRowExtend,
  catchErrorRowExtend,
} = require("./getFileItemExtend");

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
      if (ignoreList[currentDirName]) {
        temp.push((lastRe) =>
          catchErrorRowExtend(
            lastRe,
            currentDirPath,
            currentDirItemArr.length > 1
              ? `includes ${currentDirItemArr.length} items`
              : "include 1 item",
            currentPreString,
            currentPreExtendString,
            "└── ".padStart(7),
            initPad,
            currentColor,
            "ignore current dir"
          )
        );
      } else {
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
                currentDirPath,
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
      }

      return temp
        .reduce((pre, current) => pre.then(current), Promise.resolve(lastRe))
        .then((lastRe) => ({ lastRe }));
    })
    .catch(() => {
      const lastReWithCatch = catchErrorRowExtend(
        lastRe,
        currentDirPath,
        currentDirName,
        currentPreString.slice(0, -1),
        currentPreExtendString.slice(0, -1),
        isLast ? "└── " : "├── ",
        initPad,
        currentColor,
        "can not open current dir"
      );
      return { lastRe: lastReWithCatch, error: 1 };
    })
    .then(({ lastRe, error }) => {
      dirSizeMap[currentDirPath] = currentDirSize;
      if (!error) {
        // 得到结果，替换当前文件夹大小的占位符
        const index = lastRe.lastIndexOf(
          "&&--size-placeHolder-by-powerTree--&&"
        );
        if (index !== -1) {
          return (
            lastRe.slice(0, index) +
            prettyBytes(currentDirSize) +
            lastRe.slice(index + 37)
          );
        } else {
          return lastRe;
        }
      }
      return lastRe;
    });
}

exports.getAllFileExtend = getAllFileExtend;
