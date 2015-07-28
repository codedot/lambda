var mlc = require("./mlc");
var fs = require("fs");

var parser = new mlc.Parser();
var src = fs.readFileSync(process.argv[2], "utf8");
var dict = parser.parse(src);
var macros = dict.macros;

var i;

function obj2mlc(obj)
{
	var node = obj.node;

	if ("atom" == node)
		return obj.name;

	if ("abst" == node) {
		var body = obj2mlc(obj.body);
		var sep;

		if ("abst" == obj.body.node)
			sep = ", ";
		else
			sep = ": ";

		return obj.var + sep + body;
	}

	if ("appl" == node) {
		var left = obj2mlc(obj.left);
		var right = obj2mlc(obj.right);

		if ("abst" == obj.left.node)
			left = "(" + left + ")";

		if ("atom" != obj.right.node)
			right = "(" + right + ")";

		return left + " " + right;
	}
}

console.log(obj2mlc(dict.term) + ", where:");

for (i = 0; i < macros.length; i++) {
	var macro = macros[i];
	var id = macro.id;
	var def = macro.def;

	console.log(id + " = " + obj2mlc(def) + ";");
}
