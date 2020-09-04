const { color, zipFile } = require("./colorForType");
const mime = require("mime-types");

function getColor(currentPath, isDir, canExec) {
  if (isDir) {
    return color["folder"];
  } else {
    if (canExec) {
      return color["execFile"];
    } else {
      let type = mime.contentType(currentPath);
      try {
        if (type in zipFile) {
          return color["zip"];
        } else if (
          type.startsWith("image") ||
          (type.startsWith("video") && !currentPath.endsWith(".ts"))
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
