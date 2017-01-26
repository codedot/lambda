const fs = require("fs");
const path = require("path");

exports.debug = fs.readFileSync(path.join(__dirname, "debug.mlc"), "utf8");
exports.fact = fs.readFileSync(path.join(__dirname, "fact.mlc"), "utf8");
exports.helper = fs.readFileSync(path.join(__dirname, "helper.txt"), "utf8");
