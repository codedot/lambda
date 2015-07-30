var head = "${\n#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n\nchar *var(int fresh);\nchar *place(char *buf, const char *format, char *str);\n\n#define ABST(BUF, STR) place((BUF), \"%s: %%s\", (STR))\n#define APPL(BUF, STR) place((BUF), \"%s (%%s)\", (STR))\n#define ATOM(BUF, STR) place((BUF), \"%s\", (STR))\n}$\n\n\\print {\n\t/* Output results of read-back. */\n\tputs(RVAL);\n\tfree(RVAL);\n} \\atom;\n\n\\read[a] {\n\t/* Unshare variable. */\n} \\share[\\copy(b, \\read_{LVAL}(a)), b];\n\n\\read[a] {\n\t/* Initiate application. */\n} \\apply[\\lambda(b, \\read_{LVAL}(a)), b];\n\n\\read[a] {\n\t/* Read back abstraction. */\n} \\lambda[\\atom_{var(1)}, \\read_{ABST(LVAL, var(0))}(a)];\n\n\\lambda[\\read_{APPL(strdup(\"%s\"), RVAL)}(a), a] {\n\t/* Read back application. */\n} \\atom;\n\n\\read[\\atom_{ATOM(LVAL, RVAL)}] {\n\t/* Read back an atom. */\n} \\atom;\n\n\\copy[\\atom_{RVAL}, \\atom_{strdup(RVAL)}] {\n\t/* Copy an atom. */\n} \\atom;\n\n\\dup[\\atom_{RVAL}, \\atom_{strdup(RVAL)}] {\n\t/* Duplicate an atom. */\n} \\atom;\n\n\\lambda[a, b] {\n\t/* Unshare variable. */\n} \\share[\\copy(c, \\lambda(a, b)), c];\n\n\\lambda[a, b] {\n\t/* Initiate application. */\n} \\apply[\\lambda(c, \\lambda(a, b)), c];\n\n\\lambda[a, b] {\n\t/* Apply a closed term. */\n} \\lambda[a, b];\n\n\\copy[a, b] {\n\t/* Unshare variable. */\n} \\share[\\copy(c, \\copy(a, b)), c];\n\n\\copy[a, b] {\n\t/* Initiate application. */\n} \\apply[\\lambda(c, \\copy(a, b)), c];\n\n\\copy[\\lambda(a, b), \\lambda(c, d)] {\n\t/* Initiate copy of a closed term. */\n} \\lambda[\\dup(a, c), \\dup(b, d)];\n\n\\dup[\\amb(a, \\share(b, c), c), \\amb(d, \\share(e, f), f)] {\n\t/* Duplicate sharing. */\n} \\share[\\dup(b, e), \\dup(a, d)];\n\n\\dup[\\apply(a, b), \\apply(c, d)] {\n\t/* Duplicate application. */\n} \\apply[\\dup(a, c), \\dup(b, d)];\n\n\\dup[\\lambda(a, b), \\lambda(c, d)] {\n\t/* Duplicate abstraction. */\n} \\lambda[\\dup(a, c), \\dup(b, d)];\n\n\\dup[a, b] {\n\t/* Finish duplication. */\n} \\dup[a, b];\n\n\\erase {\n\t/* Erase an atom. */\n\tfree(RVAL);\n} \\atom;\n\n\\erase {\n\t/* Erase sharing. */\n} \\share[a, a];\n\n\\erase {\n\t/* Erase application. */\n} \\apply[\\erase, \\erase];\n\n\\erase {\n\t/* Erase abstraction. */\n} \\lambda[\\erase, \\erase];\n\n\\erase {\n\t/* Erase copy initiator. */\n} \\copy[\\erase, \\erase];\n\n\\erase {\n\t/* Erase duplicator. */\n} \\dup[\\erase, \\erase];\n\n\\erase {\n\t/* Finish erasing. */\n} \\erase;\n\n$$\n";

var tail = "\n$$\n\nchar *var(int fresh)\n{\n\tstatic int id;\n\n\tchar buf[BUFSIZ];\n\n\tif (fresh)\n\t\t++id;\n\n\tsprintf(buf, \"v%d\", id);\n\treturn strdup(buf);\n}\n\nchar *place(char *buf, const char *format, char *str)\n{\n\tsize_t size = strlen(format) + strlen(str);\n\tchar *sub = malloc(size);\n\tchar *result = malloc(strlen(buf) + size);\n\n\tsprintf(sub, format, str);\n\tsprintf(result, buf, sub);\n\n\tfree(buf);\n\tfree(str);\n\tfree(sub);\n\treturn result;\n}\n\ninagent *inaux(void *aux, void *offline)\n{\n\tfprintf(stderr, \"inaux: unexpected call\\n\");\n\texit(EXIT_FAILURE);\n\treturn NULL;\n}\n\nint main(int argc, char *argv[])\n{\n\tindebug = (1 < argc);\n\tinteract();\n\treturn 0;\n}";

var mlc = require("./mlc");
var fs = require("fs");

var parser = new mlc.Parser();
var src = fs.readFileSync(process.argv[2], "utf8");
var dict = parser.parse(src);
var macros = dict.macros;
var term = dict.term;
var lastwire = 0;

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

function getwire(hint)
{
	if (!hint)
		hint = "";

	++lastwire;

	return "w" + lastwire.toFixed(0) + hint;
}

function mktwins(left, right)
{
	var fvleft = getfv(left);
	var fvright = getfv(right);
	var shared = getcap(fvleft, fvright);
	var atom;

	for (atom in shared) {
		var wleft = getwire("left" + atom);
		var wright = getwire("right" + atom);

		shared[atom] = {
			left: wleft,
			right: wright
		};
	}

	return shared;
}

function psi(shared)
{
	var list = [];
	var template = "%s = \\amb(%s, \\share(%s, %s), %s)";
	var atom;

	for (atom in shared) {
		var twins = shared[atom];
		var wleft = twins.left;
		var wright = twins.right;
		var wire = getwire("back" + atom);
		var eqn = template;

		eqn = eqn.replace("%s", wleft);
		eqn = eqn.replace("%s", wright);
		eqn = eqn.replace("%s", atom);
		eqn = eqn.replace("%s", wire);
		eqn = eqn.replace("%s", wire);

		list.push(eqn);
	}

	return list;
}

function gamma(obj, root)
{
	var list = [];
	var node = obj.node;
	var eqn = root + " = %s";

	if ("atom" == node) {
		var agent = "\\atom_{strdup(\"%s\")}";

		if (obj.free)
			agent = agent.replace("%s", obj.name);
		else
			agent = obj.name;

		eqn = eqn.replace("%s", agent);
		list.push(eqn);
	} else if ("abst" == node) {
		var tree = "\\lambda(%s, %s)";
		var body = obj.body;
		var fv = getfv(body);
		var id = obj.var;
		var wire = getwire("body" + id);

		if (id in fv)
			agent = id;
		else
			agent = "\\erase";

		tree = tree.replace("%s", agent);
		tree = tree.replace("%s", wire);
		eqn = eqn.replace("%s", tree);
		list.push(eqn);

		body = gamma(body, wire);
		list = list.concat(body);
	} else if ("appl" == node) {
		var wleft = getwire("left");
		var wright = getwire("right");
		var agent = "\\apply(%s, %s)";
		var left = obj.left;
		var right = obj.right;
		var shared = mktwins(left, right);

		agent = agent.replace("%s", wleft);
		agent = agent.replace("%s", wright);
		eqn = eqn.replace("%s", agent);
		list.push(eqn);

		left = gamma(left, wleft);
		right = gamma(right, wright);
		shared = psi(shared);
		list = list.concat(left, right, shared);
	}

	return list;
}

function alpha(obj, bv)
{
	var node = obj.node;

	if (!bv)
		bv = {};

	if ("atom" == node) {
		var name = obj.name;

		if (name in bv) {
			obj = {
				node: "atom",
				name: bv[name],
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
		var wire = getwire(id);
		var body;

		bv[id] = wire;
		body = alpha(obj.body, bv);
		delete bv[id];

		obj = {
			node: "abst",
			var: wire,
			body: body
		};
	} else if ("appl" == node) {
		var left = alpha(obj.left, bv);
		var right = alpha(obj.right, bv);

		obj = {
			node: "appl",
			left: left,
			right: right
		};
	}

	return obj;
}

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

term = alpha(term);

console.log("%s", head);

console.log("\\read_{strdup(\"%s\")}(\\print) = root;");

eqns = gamma(term, "root");
for (i = 0; i < eqns.length; i++)
	console.log(eqns[i] + ";");

console.log("%s", tail);
