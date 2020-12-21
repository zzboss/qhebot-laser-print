const fileutil = require("../util/fileUtil");
const gcodeUtil = require("../util/gcodeUtil");
const path = require("path");

const inputPath = "../assets/gcode/input.gcode";
const outputPath = "../assets/gcode/output.gcode";

fileutil.parseGcodeFile(
  path.join(__dirname, inputPath),
  path.join(__dirname, outputPath),
  gcodeUtil.parseGcode
);
