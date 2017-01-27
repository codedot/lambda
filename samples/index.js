const fs = require("fs");
const path = require("path");

exports.asperti = fs.readFileSync(path.join(__dirname, "asperti.mlc"), "utf8");
exports.debug = fs.readFileSync(path.join(__dirname, "debug.mlc"), "utf8");
exports.exp = fs.readFileSync(path.join(__dirname, "exp.mlc"), "utf8");
exports.fact = fs.readFileSync(path.join(__dirname, "fact.mlc"), "utf8");
exports.helper = fs.readFileSync(path.join(__dirname, "helper.txt"), "utf8");
exports.larger = fs.readFileSync(path.join(__dirname, "larger.mlc"), "utf8");
exports.test = fs.readFileSync(path.join(__dirname, "test.mlc"), "utf8");
