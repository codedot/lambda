var mlc = require("./mlc");
var fs = require("fs");

var parser = new mlc.Parser();
var src = fs.readFileSync(process.argv[2], "utf8");
var dict = parser.parse(src);
var macros = dict.macros;

var i;

console.log(dict.term);

for (i = 0; i < macros.length; i++) {
	var macro = macros[i];
	var id = macro.id;
	var def = macro.def;

	console.log(id, def);
}
