const path = require("path");

const { getDirRowBase } = require("./getDirItemBase");
const { getFileRowBase, catchErrorRowBase } = require("./getFileItemBase");

/**
 * 按照基础命令输出信息, 直接进行打印
 * @param {string} currentDirPath 当前文件夹全路径
 * @param {string} currentDirName 当前文件夹名称
 * @param {string} currentPreString 当前路径层级的连接字符串
 * @param {boolean} colorful 当前是否是颜色模式
 * @param {boolean} isLast 当前文件夹是否是当前层级的最后一个
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
        const temp = currentDirItemArr.map((fileItem, i) => {
          if (fileItem.isFile()) {
            return () =>
              getFileRowBase(
                currentDirPath,
                fileItem.name,
                currentPreString,
                colorful,
                i === currentDirItemArr.length - 1
                  ? "└── ".padStart(7)
                  : "├── ".padStart(7)
              );
          }
          if (fileItem.isDirectory()) {
            return () =>
              getAllFileBase(
                path.join(currentDirPath, fileItem.name),
                fileItem.name,
                i === currentDirItemArr.length - 1
                  ? currentPreString + " ".padStart(4)
                  : currentPreString + "│".padStart(4),
                colorful,
                i === currentDirItemArr.length - 1
              );
          }
          return () =>
            catchErrorRowBase(
              path.join(currentDirPath, fileItem.name),
              currentPreString,
              i === currentDirItemArr.length - 1
                ? "└── ".padStart(7)
                : "├── ".padStart(7)
            );
        });
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

exports.getAllFileBase = getAllFileBase;
