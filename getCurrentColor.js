const mime = require("mime-types");
const { color, zipFile } = require("./colorForType");

/**
 * 根据传入参数获取颜色方案
 * @param {String} currentName 当前文件/文件夹名称
 * @param {Boolean} isDir 是否是文件
 * @param {Boolean} canExec 是否是可执行
 */
function getColor(currentName, isDir, canExec) {
  if (isDir) {
    return color["folder"];
  } else {
    if (canExec) {
      return color["execFile"];
    } else {
      const type = mime.contentType(currentName);
      try {
        if (type in zipFile) {
          return color["zip"];
        } else if (
          type.startsWith("image") ||
          (type.startsWith("video") && !currentName.endsWith(".ts"))
        ) {
          return color["extendFile"];
        } else {
          return color["file"];
        }
      } catch (e) {
        return color["file"];
      }
    }
  }
}

exports.getColor = getColor;
