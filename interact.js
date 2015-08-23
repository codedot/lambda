var inet = require("./inet");
var fs = require("fs");

var stdout = process.stdout;
var parser = new inet.Parser();
var src = fs.readFileSync(process.argv[2], "utf8");
var system = parser.parse(src);
var inverb = system.code;
var inrules = system.rules;
var inconf = system.conf;

var inenv = {};
var inqueue = [];
var types = {
	wire: 0,
	amb: 1
};
var ntypes = 2;
var wiretype, ambtype, table;

function addtypes(tree)
{
	var node = tree.node;
	var pax = tree.pax;
	var agent = node.agent;
	var type = types[agent];
	var i;

	if ("wire" == agent)
		return;

	if (!type) {
		types[agent] = ntypes;
		++ntypes;
	}

	for (i = 0; i < pax.length; i++)
		addtypes(pax[i]);
}

function deadlock()
{
	stdout.write("!");
}

function rewire(wire, agent)
{
	var twin = wire.twin;
	var key;

	if (wire.type != wiretype) {
		addpair(wire, agent);
		stdout.write("@");
		return;
	}

	for (key in twin)
		delete twin[key];

	for (key in agent)
		twin[key] = agent[key];

	if (agent.twin)
		agent.twin.twin = twin;

	stdout.write("~");
}

function eriwer(agent, wire)
{
	rewire(wire, agent);
}

function determ(amb, agent)
{
	var wire = amb;
	var twin = amb.twin;
	var main = amb.main;
	var aux = amb.aux;

	if (amb.type != ambtype) {
		addpair(amb, agent);
		stdout.write("&");
		return;
	}

	addpair(main, agent);

	wire.type = wiretype;
	delete wire.main;
	delete wire.aux;
	twin.type = wiretype;
	delete twin.main;
	delete twin.aux;
	addpair(wire, aux);

	stdout.write("?");
}

function mreted(agent, amb)
{
	determ(amb, agent);
}

function nnodes(tree)
{
	var pax = tree.pax;
	var n = 1;
	var i;

	for (i = 0; i < pax.length; i++)
		n += nnodes(pax[i]);

	return n;
}

function getcost(left, right)
{
	var cost = -1;
	var i;

	--cost;
	left = left.pax;
	for (i = 0; i < left.length; i++)
		cost += 1 + nnodes(left[i]);

	--cost;
	right = right.pax;
	for (i = 0; i < right.length; i++)
		cost += 1 + nnodes(right[i]);

	return cost;
}

function cpwlist(orig)
{
	var copy = [];
	var i;

	for (i = 0; i < orig.length; i++) {
		var img = orig[i];
		var wire = {
			type: wiretype,
			twin: img.twin.id
		};

		copy.push(wire);
	}

	for (i = 0; i < copy.length; i++) {
		var wire = copy[i];

		wire.twin = copy[wire.twin];
	}

	return copy;
}

function clone(img, context)
{
	var type = img.type;

	if (wiretype == type) {
		var wlist = context.wlist;
		var id = img.id;

		return wlist[id];
	} else if (ambtype == type) {
		var active = clone(img.twin.active, context);
		var main = clone(img.main, context);
		var aux = clone(img.aux, context);
		var twin = {
			type: type,
			main: main,
			aux: aux
		};
		var copy = {
			type: type,
			main: main,
			aux: aux
		};

		copy.twin = twin;
		twin.twin = copy;

		addpair(active, twin);

		return copy;
	} else {
		var lval = context.lval;
		var rval = context.rval;
		var effect = img.effect;
		var imgpax = img.pax;
		var pax = [];
		var copy = {
			type: type,
			pax: pax
		};
		var i;

		for (i = 0; i < imgpax.length; i++)
			pax[i] = clone(imgpax[i], context);

		copy.data = effect.call(inenv, lval, rval);
		return copy;
	}
}

function mkeffect(code, expr)
{
	code = code.replace(/^{(.*)}$/, "$1");

	if (expr)
		code = "return (" + code + ");";

	return new Function("LVAL", "RVAL", code);
}

function apply(left, right, code)
{
	var effect = mkeffect(code);
	var ltype = left.node.agent;
	var rtype = right.node.agent;
	var human = ltype + "><" + rtype;
	var limg = [];
	var rimg = [];
	var wires = {};
	var wlist = [];
	var i, name;

	function interact(lagent, ragent)
	{
		var wcopy = cpwlist(wlist);
		var lpax = lagent.pax;
		var rpax = ragent.pax;
		var lval = lagent.data;
		var rval = ragent.data;
		var context = {
			wlist: wcopy,
			lval: lval,
			rval: rval
		};

		for (i = 0; i < limg.length; i++) {
			var img = limg[i];
			var active = lpax[i];
			var copy = clone(img, context);

			addpair(copy, active);
		}

		for (i = 0; i < rimg.length; i++) {
			var img = rimg[i];
			var active = rpax[i];
			var copy = clone(img, context);

			addpair(copy, active);
		}

		effect.call(inenv, lval, rval);

		stdout.write("x");
	}

	interact.cost = getcost(left, right);
	interact.queue = [];
	interact.human = human;
	inqueue.push(interact);

	left = left.pax;
	for (i = 0; i < left.length; i++)
		limg[i] = encode(left[i], wires);

	right = right.pax;
	for (i = 0; i < right.length; i++)
		rimg[i] = encode(right[i], wires);

	for (name in wires) {
		var wire = wires[name];
		var twin = wire.twin;

		wire.id = wlist.length;
		wlist.push(wire);

		twin.id = wlist.length;
		wlist.push(twin);
	}

	return interact;
}

function gettable()
{
	var tab = [];
	var custom = {};
	var left, right, type;

	for (i = 0; i < inrules.length; i++) {
		var rule = inrules[i];
		var left = rule.left;
		var right = rule.right;
		var code = rule.code;
		var lrfunc, rlfunc;

		addtypes(left);
		addtypes(right);

		lrfunc = apply(left, right, code);
		custom[lrfunc.human] = lrfunc;

		rlfunc = apply(right, left, code);
		custom[rlfunc.human] = rlfunc;
	}

	for (i = 0; i < inconf.length; i++) {
		var eqn = inconf[i];
		var left = eqn.left;
		var right = eqn.right;

		addtypes(left);
		addtypes(right);
	}

	stdout.write("_><_");
	for (type in types)
		stdout.write("\t" + type);
	stdout.write("\n");

	for (left in types) {
		var row = [];

		stdout.write(left);

		for (right in types) {
			var lr = custom[left + "><" + right];
			var rl = custom[right + "><" + left];
			var human = left + "><" + right;
			var rule = deadlock;

			if ("wire" == left)
				rule = rewire;
			else if ("wire" == right)
				rule = eriwer;
			else if ("amb" == left)
				rule = determ;
			else if ("amb" == right)
				rule = mreted;
			else if (lr)
				rule = lr;
			else if (rl)
				rule = rl;
			else
				human = "----";

			human = human.replace(/\bwire\b/g, "~");
			human = human.replace(/\bamb\b/g, "?");
			human = human.replace(/^(.).*><(.).*/, "$1><$2");
			human = human.replace("><", ">" + rule.cost + "<");
			stdout.write("\t" + human);

			row[types[right]] = rule;
		}

		stdout.write("\n");
		tab[types[left]] = row;
	}

	return tab;
}

function compare(f, g)
{
	return f.cost - g.cost;
}

function reduce()
{
	var i;

	for (i = 0; i < inqueue.length; i++) {
		var rule = inqueue[i];
		var human = rule.human;
		var queue = rule.queue;
		var pair = queue.shift();

		if (pair) {
			rule(pair.left, pair.right);
			return true;
		}
	}

	return false;
}

function addpair(left, right)
{
	var row = table[left.type];
	var cell = row[right.type];

	cell.queue.push({
		left: left,
		right: right
	});
}

function encode(tree, wires, rt)
{
	var node = tree.node;
	var code = node.code;
	var agent = node.agent;
	var type = types[agent];
	var pax = tree.pax;
	var imgpax = [];
	var i;

	for (i = 0; i < pax.length; i++)
		imgpax[i] = encode(pax[i], wires, rt);

	pax = imgpax;
	tree = {
		type: type,
		pax: imgpax
	};

	if (wiretype == type) {
		var name = node.name;
		var wire = wires[name];

		if (wire) {
			wire.twin = tree;
			tree.twin = wire;
		}

		delete tree.pax;

		wires[name] = tree;
	} else if (ambtype == type) {
		var active = pax.shift();
		var main = pax.shift();
		var aux = pax.shift();
		var twin = {
			type: type,
			main: main,
			aux: aux,
			twin: tree
		};

		tree.main = main;
		tree.aux = aux;
		tree.twin = twin;
		delete tree.pax;

		if (rt)
			addpair(active, twin);
		else
			twin.active = active;
	} else {
		var effect = mkeffect(code, true);

		if (rt)
			tree.data = effect.call(inenv);
		else
			tree.effect = effect;
	}

	return tree;
}

function init()
{
	var wires = {};
	var effect = mkeffect(inverb);
	var i;

	for (i = 0; i < inconf.length; i++) {
		var eqn = inconf[i];
		var left = eqn.left;
		var right = eqn.right;

		left = encode(left, wires, true);
		right = encode(right, wires, true);
		addpair(left, right);
	}

	effect.call(inenv);
}

deadlock.cost = Infinity;
deadlock.queue = [];
deadlock.human = "dead>!<lock";
inqueue.push(deadlock);

determ.cost = 1;
mreted.cost = 1;
determ.queue = [];
mreted.queue = [];
determ.human = "amb><_";
mreted.human = "_><amb";
inqueue.push(determ);
inqueue.push(mreted);

rewire.cost = -3;
eriwer.cost = -3;
rewire.queue = [];
eriwer.queue = [];
rewire.human = "wire><_";
eriwer.human = "_><wire";
inqueue.push(rewire);
inqueue.push(eriwer);

wiretype = types["wire"];
ambtype = types["amb"];

table = gettable();

inqueue.sort(compare);

init();

stdout.write("\nApplying interaction rules:\n");
while (true) {
	var active = reduce();

	if (!active)
		break;
}
stdout.write("\nNo more active pairs left.\n");
