var inet = require("./inet");
var fs = require("fs");

var parser = new inet.Parser();
var src = fs.readFileSync(process.argv[2], "utf8");
var system = parser.parse(src);
var inrules = system.rules;
var inconf = system.conf;

var inqueue = [];
var table;

function gettypes(tree, dict)
{
	var node = tree.node;
	var pax = tree.pax;
	var i;

	if (!dict)
		dict = {};

	dict[node.agent] = true;

	for (i = 0; i < pax.length; i++)
		gettypes(pax[i], dict);

	return dict;
}

function getkeys(dict)
{
	var list = [];
	var name;

	process.stdout.write("_><_");

	for (name in dict) {
		process.stdout.write("\t" + name);
		list.push(name);
	}

	process.stdout.write("\n");

	return list;
}

function deadlock()
{
	console.error("No applicable rule");
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

	function interact(lagent, ragent)
	{
		console.log(left, right);
	}

	interact.cost = getcost(left, right);
	interact.queue = [];
	interact.human = ltype + "><" + rtype;
	inqueue.push(interact);
	return interact;
}

function gettable()
{
	var types = {
		wire: true,
		amb: true
	};
	var custom = {};
	var dict = {};
	var i, j, n;

	for (i = 0; i < inrules.length; i++) {
		var rule = inrules[i];
		var left = rule.left;
		var right = rule.right;
		var lrfunc = apply(left, right);
		var rlfunc = apply(right, left);

		gettypes(left, types);
		gettypes(right, types);

		custom[lrfunc.human] = lrfunc;
		custom[rlfunc.human] = rlfunc;
	}

	for (i = 0; i < inconf.length; i++) {
		var eqn = inconf[i];
		var left = eqn.left;
		var right = eqn.right;

		gettypes(left, types);
		gettypes(right, types);
	}

	types = getkeys(types);
	n = types.length;

	for (i = 0; i < n; i++) {
		var left = types[i];
		var row = {};

		process.stdout.write(left);

		for (j = 0; j < n; j++) {
			var right = types[j];
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
			process.stdout.write("\t" + human);

			row[right] = rule;
		}

		process.stdout.write("\n");
		dict[left] = row;
	}

	return dict;
}

function compare(f, g)
{
	return f.cost - g.cost;
}

function getpair()
{
	var i;

	for (i = 0; i < inqueue.length; i++) {
		var pair = inqueue[i].queue.shift();

		if (pair)
			return pair;
	}
}

function putpair(left, right)
{
	var row = table[left.node.agent];
	var cell = row[right.node.agent];

	cell.queue.push({
		left: left,
		right: right
	});
}

function init()
{
	var i;

	for (i = 0; i < inconf.length; i++) {
		var eqn = inconf[i];
		var left = eqn.left;
		var right = eqn.right;

		putpair(left, right);
	}
}

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
