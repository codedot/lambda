var inet = require("./inet");
var fs = require("fs");

var stdout = process.stdout;
var parser = new inet.Parser();
var src = fs.readFileSync(process.argv[2], "utf8");
var system = parser.parse(src);
var inrules = system.rules;
var inconf = system.conf;

var inqueue = [];
var types = {
	wire: 0,
	amb: 1
};
var ntypes = 2;
var table;

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
	stdout.write("No applicable rule\n");
}

function rewire(wire, agent)
{
}

function eriwer(agent, wire)
{
	rewire(wire, agent);
}

function determ(amb, agent)
{
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

function apply(left, right)
{
	var ltype = left.node.agent;
	var rtype = right.node.agent;
	var human = ltype + "><" + rtype;

	function interact(lagent, ragent)
	{
	}

	interact.cost = getcost(left, right);
	interact.queue = [];
	interact.human = human;
	inqueue.push(interact);
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
		var lrfunc = apply(left, right);
		var rlfunc = apply(right, left);

		addtypes(left);
		addtypes(right);

		custom[lrfunc.human] = lrfunc;
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

function putpair(left, right)
{
	var row = table[left.type];
	var cell = row[right.type];

	cell.queue.push({
		left: left,
		right: right
	});
}

function encode(tree, wires)
{
	var node = tree.node;
	var agent = node.agent;
	var type = types[agent];
	var pax = tree.pax;
	var i;

	for (i = 0; i < pax.length; i++)
		pax[i] = encode(pax[i], wires);

	tree.type = type;

	if ("wire" == agent) {
		var name = node.name;
		var wire = wires[name];

		if (wire) {
			wire.twin = tree;
			tree.twin = wire;
		}

		delete tree.pax;

		wires[name] = tree;
	} else if ("amb" == agent) {
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

		putpair(active, twin);
	}

	delete tree.node;
	return tree;
}

function init()
{
	var wires = {};
	var i;

	for (i = 0; i < inconf.length; i++) {
		var eqn = inconf[i];
		var left = eqn.left;
		var right = eqn.right;

		left = encode(left, wires);
		right = encode(right, wires);
		putpair(left, right);
	}
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

table = gettable();

inqueue.sort(compare);

init();

stdout.write("\nApplying interaction rules:\n");
while (reduce())
	stdout.write(".");
stdout.write("\nNo more active pairs left.\n");
