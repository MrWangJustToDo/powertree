const fs = require("fs");
const chalk = require("chalk");

// random color
function getRandomColor() {
  return "#" + Math.random().toString(16).slice(2, 5);
}

function cache(fn) {
  const map = {};
  return function (key) {
    if (!map[key]) {
      map[key] = fn(key);
    }
    return map[key];
  };
}

// transform function from callback to promise
function transformFunctionFromCBToP(func) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      func.call(this, ...args, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  };
}

// promise fs.stat
function fileStat() {
  if (fs.promises && typeof fs.promises === "object") {
    return fs.promises.stat;
  } else {
    return transformFunctionFromCBToP(fs.stat);
  }
}

// promise fs.readDir
function readDir() {
  if (fs.promises && typeof fs.promises === "object") {
    return fs.promises.readdir;
  } else {
    return transformFunctionFromCBToP(fs.readdir);
  }
}

// get chmod
function getChmod(para) {
  const temp = para.toString(8);
  const fileMod = temp.slice(temp.length - 3);
  return getMod(fileMod[0]) + getMod(fileMod[1]) + getMod(fileMod[2]);
}

// transform chmod
function getMod(para) {
  switch (para) {
    case "0":
      return "---";
    case "1":
      return "--x";
    case "2":
      return "-w-";
    case "3":
      return "-wx";
    case "4":
      return "r--";
    case "5":
      return "r-x";
    case "6":
      return "rw-";
    case "7":
      return "rwx";
    default:
      return "xxx";
  }
}

// userCache
const userMap = {};

// getUser
function transformUidToUser({ uid, currentColor }) {
  return new Promise((resolve, reject) => {
    if (uid in userMap) {
      resolve(userMap[uid]);
    } else {
      fs.readFile("/etc/passwd", (err, data) => {
        const passwd = data.toString().split("\n");
        for (let user of passwd) {
          const userArray = user.split(/:/g);
          if (userArray[2] == uid) {
            userMap[uid] = currentColor
              ? userArray[0]
              : chalk.redBright(userArray[0]);
            return resolve(userMap[uid]);
          }
        }
        userMap[uid] = "uid not found";
        reject("uid not found");
      });
    }
  });
}

function execFileJudge(modStr) {
  if (modStr[2] == "x" || modStr[5] == "x" || modStr[8] == "x") {
    return true;
  } else {
    return false;
  }
}

function flushItem(message, dug = false) {
  if (!dug) {
    if (process && process.stderr) {
      const len = process.stderr.columns;
      process.stderr.cursorTo(0);
      process.stderr.clearLine(1);
      if (message.length <= len) {
        process.stderr.write(message);
      } else {
        process.stderr.write(message.slice(0, len - 3) + "...");
      }
    }
  }
}

exports.getRandomColor = getRandomColor;
exports.fileStat = fileStat();
exports.readDir = readDir();
exports.getChmod = cache(getChmod);
exports.transformUidToUser = transformUidToUser;
exports.execFileJudge = cache(execFileJudge);
exports.flushItem = flushItem;
exports.cache = cache;
