const fs = require("fs");

/**
 * 读取文件数据
 * @param {String} readFilePath  读取文件路径
 * @param {String} writeFilePath 写入文件路径
 * @param {Function} callback      解析一行 gcode 的函数
 * @returns 文件内容, 按行存入数组
 */
function parseGcodeFile(readFilePath, writeFilePath, callback) {
  let data = fs.readFileSync(readFilePath, "utf-8");
  let lines = data.split("\n").map(item => item.trim());
  let arr = [];
  lines.forEach(line => {
    let res = callback(line);
    if (res instanceof Array) {
      res.forEach(item => {
        arr.push(item);
      });
    } else {
      if (res) {
        arr.push(res);
      }
    }
  });
  arr.unshift(`        N${arr.length}`);
  console.log(arr[0]);
  let gcode = arr.join("\r\n");
  fs.writeFileSync(writeFilePath, gcode);
}

module.exports = { parseGcodeFile };
