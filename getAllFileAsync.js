const path = require("path");
const prettyBytes = require("pretty-bytes");

const { ignoreList } = require("./ignoreList");
const { getDirRowExAsync } = require("./getDirItemAsync");
const { getRandomColor, dirPathProgress } = require("./tools");
const {
  catchErrorRowExtendAsync,
  getFileRowExtendAsync,
} = require("./getFileItemAsync");

function getAllFileExtendAsync(
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
  return getDirRowExAsync(
    currentDirPath,
    currentDirName,
    currentPreString.slice(0, -1),
    currentPreExtendString.slice(0, -1),
    isLast ? "└── " : "├── ",
    initPad,
    currentColor,
    unixModule
  )
    .then(([currentDirItemArr, currentDirValue]) => {
      const temp = [];
      if (ignoreList[currentDirName]) {
        temp.push(() =>
          catchErrorRowExtendAsync(
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
        dirPathProgress.current += currentDirItemArr.length;
      } else {
        for (let i = 0; i < currentDirItemArr.length; i++) {
          if (currentDirItemArr[i].isFile()) {
            temp.push(() =>
              getFileRowExtendAsync(
                currentDirPath,
                currentDirItemArr[i].name,
                currentPreString,
                currentPreExtendString,
                i === currentDirItemArr.length - 1
                  ? "└── ".padStart(7)
                  : "├── ".padStart(7),
                initPad,
                currentColor
              ).then(({ currentTemp, size }) => {
                // 统计当前文件夹下文件的大小
                currentDirSize += size;
                return currentTemp;
              })
            );
          } else if (currentDirItemArr[i].isDirectory()) {
            temp.push(() =>
              getAllFileExtendAsync(
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
            temp.push(() =>
              catchErrorRowExtendAsync(
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
      return Promise.all(temp.map((it) => it())).then((children) => {
        return { lastRe: currentDirValue + children.reduce((a, b) => a + b) };
      });
    })
    .catch(() => {
      const lastReWithCatch = catchErrorRowExtendAsync(
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

exports.getAllFileExtendAsync = getAllFileExtendAsync;
