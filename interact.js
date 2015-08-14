var inet = require("./inet");
var fs = require("fs");

var parser = new inet.Parser();
var src = fs.readFileSync(process.argv[2], "utf8");
var system = parser.parse(src);
var rules = system.rules;
var conf = system.conf;

var i;

console.log({
	nrules: rules.length,
	neqns: conf.length
});
