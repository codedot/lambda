var inet = require("./inet");
var fs = require("fs");

var parser = new inet.Parser();
var src = fs.readFileSync(process.argv[2], "utf8");
var system = parser.parse(src);

var table;

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
	function interact(lagent, ragent)
	{
		console.log(left, right);
	}

	interact.cost = getcost(left, right);
	return interact;
}

function gettable(system)
{
	var rules = system.rules;
	var conf = system.conf;
	var types = {
		wire: true,
		amb: true
	};
	var custom = {};
	var dict = {};
	var i, j, n;

	for (i = 0; i < rules.length; i++) {
		var rule = rules[i];
		var left = rule.left;
		var right = rule.right;
		var ltype = left.node.name;
		var rtype = right.node.name;

		gettypes(left, types);
		gettypes(right, types);

		custom[ltype + "><" + rtype] = apply(left, right);
		custom[rtype + "><" + ltype] = apply(right, left);
	}

	for (i = 0; i < conf.length; i++) {
		var eqn = conf[i];
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

determ.cost = 1;
mreted.cost = 1;

rewire.cost = -3;
eriwer.cost = -3;

table = gettable(system);
