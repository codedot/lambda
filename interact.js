var inet = require("./inet");
var fs = require("fs");

var parser = new inet.Parser();
var src = fs.readFileSync(process.argv[2], "utf8");
var system = parser.parse(src);
var rules = system.rules;
var conf = system.conf;

var types = {
	wire: true,
	amb: true
};

var i;

function gettypes(tree, dict)
{
	var node = tree.node;
	var pax = tree.pax;
	var i;

	if (!dict)
		dict = {};

	if ("agent" == node.type)
		dict[node.name] = true;

	for (i = 0; i < pax.length; i++)
		gettypes(pax[i], dict);

	return dict;
}

for (i = 0; i < rules.length; i++) {
	var rule = rules[i];
	var left = rule.left;
	var right = rule.right;

	gettypes(left, types);
	gettypes(right, types);
}

for (i = 0; i < conf.length; i++) {
	var eqn = conf[i];
	var left = eqn.left;
	var right = eqn.right;

	gettypes(left, types);
	gettypes(right, types);
}

console.log(types);
