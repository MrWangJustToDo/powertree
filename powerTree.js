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
  return fileStat(dir)
    .then((file) => {
      if (file.isDirectory()) {
        if (extend) {
          if (process.platform !== "win32") {
            if (colorFlag) {
              return getAllFileExtend(
                "\n",
                dir,
                " ",
                " ",
                true,
                true,
                initPad,
                getRandomColor()
              );
            } else {
              return getAllFileExtend("\n", dir, " ", " ", true, true, initPad);
            }
          } else {
            if (colorFlag) {
              return getAllFileExtend(
                "\n",
                dir,
                " ",
                " ",
                true,
                false,
                initPad,
                getRandomColor()
              );
            } else {
              return getAllFileExtend(
                "\n",
                dir,
                " ",
                " ",
                true,
                false,
                initPad
              );
            }
          }
        } else {
          if (colorFlag) {
            return getAllFileBaseColorful(".\n", dir, " ", true);
          } else {
            return getAllFileBase(".\n", dir, " ", true);
          }
        }
      } else {
        return chalk.red("Path Must Be A Dir");
      }
    })
    .then((temp) => {
      return temp;
    })
    .catch((e) => {
      return chalk.red("Path Not Exist Or Permission Denied");
    });
}

exports.listFiles = listFiles;
