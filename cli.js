var run = require("./system");
var fs = require("fs");

var mlc = fs.readFileSync(process.argv[2], "utf8");

console.log(run(mlc));
