const path = require("path");

const { getDirRowBase } = require("./getDirItemBase");
const { getFileRowBase, catchErrorRowBase } = require("./getFileItemBase");

/**
 * 按照基础命令输出信息, 直接进行打印
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

exports.getAllFileBase = getAllFileBase;
