const path = require("path");
const { getDirRowBase, getDirRowEx } = require("./getDirItem");
const {
  getFileRowBase,
  getFileRowBaseColorful,
  getFileRowExtend,
} = require("./getFileItem");
const { getFolderSize, readDir, getRandomColor } = require("./tools");

function getAllFileBase(lastStr, currentDir, nextPre, isLast) {
  return new Promise((resolve) => {
    if (isLast) {
      getDirRowBase(
        lastStr,
        currentDir.substr(currentDir.lastIndexOf("/") + 1),
        nextPre.slice(0, nextPre.length - 1),
        "└── ",
        false
      ).then(resolve);
    } else {
      getDirRowBase(
        lastStr,
        currentDir.substr(currentDir.lastIndexOf("/") + 1),
        nextPre.slice(0, nextPre.length - 1),
        "├── ",
        false
      ).then(resolve);
    }
  }).then((lastStrAddCurrentDir) =>
    readDir(currentDir, { withFileTypes: true }).then((fileArr) => {
      let tempArr = [];
      for (let i = 0; i < fileArr.length; i++) {
        if (fileArr[i].isFile()) {
          if (i != fileArr.length - 1) {
            tempArr.push((preTemp) =>
              getFileRowBase(
                preTemp,
                fileArr[i].name,
                nextPre,
                "├── ".padStart(7)
              )
            );
          } else {
            tempArr.push((preTemp) =>
              getFileRowBase(
                preTemp,
                fileArr[i].name,
                nextPre,
                "└── ".padStart(7)
              )
            );
          }
        } else if (fileArr[i].isDirectory()) {
          tempArr.push((preTemp) =>
            getAllFileBase(
              preTemp,
              path.join(currentDir, fileArr[i].name),
              i !== fileArr.length - 1
                ? nextPre + "│".padStart(4)
                : nextPre + " ".padStart(4),
              i == fileArr.length - 1
            )
          );
        }
      }
      return tempArr.reduce(
        (pre, current) => pre.then((lastAdd) => current(lastAdd)),
        Promise.resolve(lastStrAddCurrentDir)
      );
    })
  );
}

function getAllFileBaseColorful(lastStr, currentDir, nextPre, isLast) {
  return new Promise((resolve) => {
    if (isLast) {
      getDirRowBase(
        lastStr,
        currentDir.substr(currentDir.lastIndexOf("/") + 1),
        nextPre.slice(0, nextPre.length - 1),
        "└── ",
        true
      ).then(resolve);
    } else {
      getDirRowBase(
        lastStr,
        currentDir.substr(currentDir.lastIndexOf("/") + 1),
        nextPre.slice(0, nextPre.length - 1),
        "├── ",
        true
      ).then(resolve);
    }
  }).then((lastStrAddCurrentDir) =>
    readDir(currentDir, { withFileTypes: true }).then((fileArr) => {
      let tempArr = [];
      for (let i = 0; i < fileArr.length; i++) {
        if (fileArr[i].isFile()) {
          if (i != fileArr.length - 1) {
            tempArr.push((preTemp) =>
              getFileRowBaseColorful(
                preTemp,
                fileArr[i].name,
                currentDir,
                nextPre,
                "├── ".padStart(7)
              )
            );
          } else {
            tempArr.push((preTemp) =>
              getFileRowBaseColorful(
                preTemp,
                fileArr[i].name,
                currentDir,
                nextPre,
                "└── ".padStart(7)
              )
            );
          }
        } else if (fileArr[i].isDirectory()) {
          tempArr.push((preTemp) =>
            getAllFileBaseColorful(
              preTemp,
              path.join(currentDir, fileArr[i].name),
              i !== fileArr.length - 1
                ? nextPre + "│".padStart(4)
                : nextPre + " ".padStart(4),
              i == fileArr.length - 1
            )
          );
        }
      }
      return tempArr.reduce(
        (pre, current) => pre.then((lastAdd) => current(lastAdd)),
        Promise.resolve(lastStrAddCurrentDir)
      );
    })
  );
}

function getAllFileExtend(
  lastStr,
  currentDir,
  nextPre,
  nextExtendPre,
  isLast,
  unixModule,
  initPad,
  currentColor
) {
  return getFolderSize(currentDir)
    .then((size) => {
      if (isLast) {
        return getDirRowEx(
          lastStr,
          currentDir,
          currentDir.substr(currentDir.lastIndexOf("/") + 1),
          nextPre.slice(0, nextPre.length - 1),
          nextExtendPre.slice(0, nextExtendPre.length - 1),
          initPad,
          "└── ",
          size,
          currentColor
        );
      } else {
        return getDirRowEx(
          lastStr,
          currentDir,
          currentDir.substr(currentDir.lastIndexOf("/") + 1),
          nextPre.slice(0, nextPre.length - 1),
          nextExtendPre.slice(0, nextExtendPre.length - 1),
          initPad,
          "├── ",
          size,
          currentColor
        );
      }
    })
    .then((lastStrAddCurrentDir) =>
      readDir(currentDir, { withFileTypes: true }).then((fileArr) => {
        let tempArr = [];
        for (let i = 0; i < fileArr.length; i++) {
          if (fileArr[i].isFile()) {
            if (i != fileArr.length - 1) {
              tempArr.push((preTemp) =>
                getFileRowExtend(
                  preTemp,
                  currentDir,
                  fileArr[i].name,
                  nextPre,
                  nextExtendPre,
                  initPad,
                  "├── ".padStart(7),
                  currentColor
                )
              );
            } else {
              tempArr.push((preTemp) =>
                getFileRowExtend(
                  preTemp,
                  currentDir,
                  fileArr[i].name,
                  nextPre,
                  nextExtendPre,
                  initPad,
                  "└── ".padStart(7),
                  currentColor
                )
              );
            }
          } else if (fileArr[i].isDirectory()) {
            tempArr.push((preTemp) =>
              getAllFileExtend(
                preTemp,
                path.join(currentDir, fileArr[i].name),
                i !== fileArr.length - 1
                  ? nextPre + "│".padStart(4)
                  : nextPre + " ".padStart(4),
                i !== fileArr.length - 1
                  ? nextExtendPre + "│".padStart(4)
                  : nextExtendPre + " ".padStart(4),
                i == fileArr.length - 1,
                unixModule,
                initPad,
                currentColor ? getRandomColor() : undefined
              )
            );
          }
        }
        return tempArr.reduce(
          (pre, current) => pre.then((lastAdd) => current(lastAdd)),
          Promise.resolve(lastStrAddCurrentDir)
        );
      })
    );
}

exports.getAllFileBase = getAllFileBase;
exports.getAllFileBaseColorful = getAllFileBaseColorful;
exports.getAllFileExtend = getAllFileExtend;
