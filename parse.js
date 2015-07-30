var mlc = require("./mlc");
var fs = require("fs");

var parser = new mlc.Parser();
var src = fs.readFileSync(process.argv[2], "utf8");
var dict = parser.parse(src);
var macros = dict.macros;
var term = dict.term;

var i;

function getcap(left, right)
{
	var dict = {};
	var prop;

	for (prop in left)
		if (prop in right)
			dict[prop] = left[prop];

	return dict;
}

function merge(left, right)
{
	var dict = {};
	var prop;

	for (prop in left)
		dict[prop] = left[prop];

	for (prop in right)
		dict[prop] = right[prop];

	return dict;
}

function getfv(obj, fv)
{
	var node = obj.node;

	if ("atom" == node) {
		var fv = {};

		fv[obj.name] = true;
		return fv;
	} else if ("abst" == node) {
		var fv = getfv(obj.body);

		delete fv[obj.var];
		return fv;
	} else if ("appl" == node) {
		var left = getfv(obj.left);
		var right = getfv(obj.right);
		var fv = merge(left, right);

		return fv;
	}
}

function markfv(obj, bv)
{
	var node = obj.node;

	if (!bv)
		bv = {};

	if ("atom" == node) {
		if (obj.name in bv)
			obj.free = false;
		else
			obj.free = true;
	} else if ("abst" == node) {
		bv[obj.var] = true;
		markfv(obj.body, bv);
		delete bv[obj.var];
	} else if ("appl" == node) {
		markfv(obj.left, bv);
		markfv(obj.right, bv);
	}
}

function obj2mlc(obj)
{
	var node = obj.node;

	if ("atom" == node) {
		var mark = obj.free ? "*" : "";

		return obj.name + mark;
	}

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

markfv(term);
console.log(obj2mlc(term) + ", where:", getfv(term));

for (i = 0; i < macros.length; i++) {
	var macro = macros[i];
	var id = macro.id;
	var def = macro.def;

	term = {
		node: "appl",
		left: {
			node: "abst",
			var: id,
			body: term
		},
		right: def
	};

	markfv(def);
	console.log(id + " = " + obj2mlc(def) + ";", getfv(def));
}

markfv(term);
console.log(obj2mlc(term), getfv(term));
