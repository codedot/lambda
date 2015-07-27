var mlc = require("./mlc");
var fs = require("fs");

var parser = new mlc.Parser();
var src = fs.readFileSync(process.argv[2], "utf8");
var dict = parser.parse(src);

console.log(dict);
