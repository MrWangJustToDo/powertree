const fileSize = require("nodejs-fs-utils");
const fs = require("fs");

// userCache
let userMap = {};

// folder size
function getFolderSize(path) {
  return new Promise((resolve, reject) => {
    fileSize.fsize(path, (err, size) => {
      resolve(size);
      reject(err);
    });
  });
}

// random color
function getRandomColor() {
  return "#" + Math.random().toString(16).slice(2, 5);
}

// transform function to promise
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
  if (fs.promises) {
    return fs.promises.stat;
  } else {
    return transformFunctionFromCBToP(fs.stat);
  }
}

// promise fs.readDir
function readDir() {
  if (fs.promises) {
    return fs.promises.readdir;
  } else {
    return transformFunctionFromCBToP(fs.readdir);
  }
}

// get chmod
function getChmod(para) {
  let temp = para.toString(8);
  let fileMod = temp.slice(temp.length - 3);
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
  }
}

// getUser
function transformUidToUser(uid) {
  return new Promise((resolve, reject) => {
    if (uid in userMap) {
      resolve(userMap[uid]);
    } else {
      fs.readFile("/etc/passwd", (err, data) => {
        let passwd = data.toString().split("\n");
        for (let user of passwd) {
          let userArray = user.split(/:/g);
          if (userArray[2] == uid) {
            userMap[uid] = userArray[0];
            return resolve(userArray[0]);
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

exports.getFolderSize = getFolderSize;
exports.getRandomColor = getRandomColor;
exports.fileStat = fileStat();
exports.readDir = readDir();
exports.getChmod = getChmod;
exports.transformUidToUser = transformUidToUser;
exports.execFileJudge = execFileJudge;
