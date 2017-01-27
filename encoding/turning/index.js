var mlc = require("./lambda");
var fs = require("fs");

var parser = new mlc.Parser();
var system = fs.readFileSync("template.txt", "utf8");
var lastwire;

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

		if (!obj.free)
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

		if ("abst" == obj.right.node)
			right = "(" + right + ")";

		if ("appl" == obj.right.node)
			right = "(" + right + ")";

		return left + " " + right;
	}

	return "[ ]";
}

function mkwire()
{
	++lastwire;
	return "w" + lastwire.toFixed(0);
}

function subst(obj, shared, side)
{
	var node = obj.node;

	if ("atom" == node) {
		var name = obj.name;

		if (name in shared) {
			var entry = shared[name];

			obj.name = entry[side];
		}
	} else if ("abst" == node) {
		var body = obj.body;

		subst(body, shared, side);
	} else if ("appl" == node) {
		subst(obj.left, shared, side);
		subst(obj.right, shared, side);
	}
}

function mktwins(left, right)
{
	var fvleft = getfv(left);
	var fvright = getfv(right);
	var shared = getcap(fvleft, fvright);
	var atom;

	for (atom in shared) {
		var wleft = mkwire();
		var wright = mkwire();

		shared[atom] = {
			left: wleft,
			right: wright
		};
	}

	subst(left, shared, "left");
	subst(right, shared, "right");

	return shared;
}

function psi(shared)
{
	var list = [];
	var template = "%s = \\fanin_{++this.id}(%s, %s)";
	var atom;

	for (atom in shared) {
		var twins = shared[atom];
		var wleft = twins.left;
		var wright = twins.right;
		var eqn = template;

		eqn = eqn.replace("%s", atom);
		eqn = eqn.replace("%s", wright);
		eqn = eqn.replace("%s", wleft);

		list.push(eqn);
	}

	return list;
}

function gamma(obj, root)
{
	var list = [];
	var node = obj.node;

	if ("atom" == node) {
		if (obj.free) {
			var agent = "\\atom_{this.mkid(\"%s\")}";

			agent = agent.replace("%s", obj.name);
			list.push(root + " = " + agent);
		} else {
			var agent = "%s";

			agent = agent.replace("%s", root);
			list.push(obj.name + " = " + agent);
		}
	} else if ("abst" == node) {
		var tree = "\\lambda(%s, %s)";
		var body = obj.body;
		var fv = getfv(body);
		var id = obj.var;
		var wire = mkwire();

		if (id in fv)
			agent = id;
		else
			agent = "\\erase";

		tree = tree.replace("%s", agent);
		tree = tree.replace("%s", wire);
		list.push(root + " = " + tree);

		body = gamma(body, wire);
		list = list.concat(body);
	} else if ("appl" == node) {
		var wleft = mkwire();
		var wright = mkwire();
		var agent = "\\apply(%s, %s)";
		var left = obj.left;
		var right = obj.right;
		var shared = mktwins(left, right);

		agent = agent.replace("%s", wright);
		agent = agent.replace("%s", root);
		list.push(wleft + " = " + agent);

		left = gamma(left, wleft);
		right = gamma(right, wright);
		shared = psi(shared);
		list = list.concat(left, right, shared);
	}

	return list;
}

function alpha(obj, bv, lvl)
{
	var node = obj.node;

	if (!bv)
		bv = {};

	if (!lvl)
		lvl = 0;

	if ("atom" == node) {
		var name = obj.name;

		if (name in bv) {
			var id = bv[name];

			obj = {
				node: "atom",
				name: id.name,
				index: lvl - id.lvl,
				free: false
			};
		} else {
			obj = {
				node: "atom",
				name: name,
				free: true
			};
		}
	} else if ("abst" == node) {
		var id = obj.var;
		var wire = mkwire();
		var old = bv[id];
		var body;

		++lvl;
		bv[id] = {
			name: wire,
			lvl: lvl
		};
		body = alpha(obj.body, bv, lvl);
		delete bv[id];

		if (old)
			bv[id] = old;

		obj = {
			node: "abst",
			var: wire,
			body: body
		};
	} else if ("appl" == node) {
		var left = alpha(obj.left, bv, lvl);
		var right = alpha(obj.right, bv, lvl);

		obj = {
			node: "appl",
			left: left,
			right: right
		};
	}

	return obj;
}

function getconf(obj)
{
	var root = "\\eval(\\read_{this.mkhole()}(\\print))";
	var conf;

	lastwire = 0;

	obj = alpha(obj);
	conf = gamma(obj, "root", 0);
	conf.push(root + " = root");
	return conf;
}

function encode(mlc)
{
	var dict = parser.parse(mlc);
	var macros = dict.macros;
	var term = dict.term;
	var inconfig = "";
	var eqns, i;

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
	}

	encode.term = obj2mlc(term);

	eqns = getconf(term);

	for (i = 0; i < eqns.length; i++)
		inconfig = inconfig.concat(eqns[i] + ";\n");

	return system.replace("INCONFIG\n", inconfig);
}

encode.obj2mlc = obj2mlc;

module.exports = encode;
