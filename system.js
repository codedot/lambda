var mlc2in = require("./encode");
var inet = require("./agents");
var fs = require("fs");

var obj2mlc = mlc2in.obj2mlc;
var example = fs.readFileSync("fact.mlc", "utf8");
var parser = new inet.Parser();
var inverb, inrules, inconf, inenv, inqueue, nwires, nambs;
var typelist, types, ntypes, wiretype, ambtype, table;

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

function norule(lagent, ragent)
{
	var ltype = typelist[lagent.type];
	var rtype = typelist[ragent.type];
	var pair = ltype + "><" + rtype;

	console.error("%s: No applicable rule", pair);
	inqueue = [];
}

function rewire(wire, agent)
{
	var twin = wire.twin;
	var twin2 = agent.twin;
	var key;

	twin.type = agent.type;
	twin.pax = agent.pax;
	twin.main = agent.main;
	twin.aux = agent.aux;
	twin.data = agent.data;

	if (twin2) {
		twin.twin = twin2;
		twin2.twin = twin;
	}
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

	wire.type = wiretype;
	delete wire.main;
	delete wire.aux;
	twin.type = wiretype;
	delete twin.main;
	delete twin.aux;
	rewire(wire, aux);

	flush([{
		left: main,
		right: agent
	}]);
}

function mreted(agent, amb)
{
	determ(amb, agent);
}

function cpwlist(orig)
{
	var copy = [];
	var i;

	for (i = 0; i < orig.length; i++) {
		var img = orig[i];
		var wire = {
			type: img.type,
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

function cpalist(orig, context)
{
	var copy = [];
	var i;

	for (i = 0; i < orig.length; i++)
		copy.push(clone(orig[i], context));

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
		var copy = context.wlist[img.id];
		var alist = context.alist;

		copy.main = alist[img.main];
		copy.aux = alist[img.aux];
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

function mkeffect(lval, rval, code, expr)
{
	var body = expr ? "return (%s);" : "%s\n\treturn true;";

	if (!lval)
		lval = "LVAL";
	if (!rval)
		rval = "RVAL";
	if (!code && expr)
		code = "void(0)";

	body = body.replace("%s", code);
	return new Function(lval, rval, body);
}

function apply(left, right, code, rl)
{
	var lnode = left.node;
	var rnode = right.node;
	var human = lnode.agent + "><" + rnode.agent;
	var lval = rl ? rnode.code : lnode.code;
	var rval = rl ? lnode.code : rnode.code;
	var effect = mkeffect(lval, rval, code);
	var limg = [];
	var rimg = [];
	var wires = {};
	var wlist = [];
	var alist = [];
	var i, name;

	function interact(lagent, ragent)
	{
		var queue = [];
		var wcopy, lpax, rpax, lval, rval, context;

		if (rl) {
			rval = lagent.data;
			lval = ragent.data;
		} else {
			lval = lagent.data;
			rval = ragent.data;
		}

		if (!effect.call(inenv, lval, rval))
			return;

		wcopy = cpwlist(wlist);
		lpax = lagent.pax;
		rpax = ragent.pax;

		context = {
			wlist: wcopy,
			lval: lval,
			rval: rval
		};

		context.alist = cpalist(alist, context);

		for (i = 0; i < limg.length; i++) {
			var img = limg[i];
			var active = lpax[i];
			var copy = clone(img, context);

			queue.push({
				left: active,
				right: copy
			});
		}

		for (i = 0; i < rimg.length; i++) {
			var img = rimg[i];
			var active = rpax[i];
			var copy = clone(img, context);

			queue.push({
				left: copy,
				right: active
			});
		}

		return queue;
	}

	interact.human = human;
	interact.count = 0;

	left = left.pax;
	for (i = 0; i < left.length; i++)
		limg[i] = encode(lval, rval, left[i], wires);

	right = right.pax;
	for (i = 0; i < right.length; i++)
		rimg[i] = encode(lval, rval, right[i], wires);

	for (name in wires) {
		var wire = wires[name];
		var twin = wire.twin;

		wire.id = wlist.length;
		wlist.push(wire);

		twin.id = wlist.length;
		wlist.push(twin);

		if (ambtype == wire.type) {
			var main = wire.main;
			var aux = wire.aux;

			wire.main = alist.length;
			twin.main = alist.length;
			alist.push(main);

			wire.aux = alist.length;
			twin.aux = alist.length;
			alist.push(aux);
		}
	}

	return interact;
}

function addrule(dict, rule)
{
	var human = rule.human;
	var entry = dict[human];

	if (!entry) {
		entry = [];
		dict[human] = entry;
	}

	entry.push(rule);
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
		addrule(custom, lrfunc);

		rlfunc = apply(right, left, code, true);
		addrule(custom, rlfunc);
	}

	for (i = 0; i < inconf.length; i++) {
		var eqn = inconf[i];
		var left = eqn.left;
		var right = eqn.right;

		addtypes(left);
		addtypes(right);
	}

	for (left in types) {
		var row = [];

		for (right in types) {
			var rules = custom[left + "><" + right];

			if (!rules) {
				if ("wire" == left)
					rules = rewire;
				else if ("wire" == right)
					rules = eriwer;
				else if ("amb" == left)
					rules = determ;
				else if ("amb" == right)
					rules = mreted;
				else
					rules = norule;
			}

			row[types[right]] = rules;
		}

		tab[types[left]] = row;

		typelist[types[left]] = left;
	}

	return tab;
}

function traverse(pair)
{
	var left = pair.left;
	var right = pair.right;
	var rules = pair.rules;
	var i;

	for (i = 0; i < rules.length; i++) {
		var rule = rules[i];
		var queue = rule(left, right);

		if (queue) {
			++rule.count;
			flush(queue);
			return;
		}
	}

	norule(left, right);
}

function reduce()
{
	var pair;

	while (pair = inqueue.shift())
		traverse(pair);
}

function flush(queue)
{
	var i;

	for (i = 0; i < queue.length; i++) {
		var pair = queue[i];
		var left = pair.left;
		var right = pair.right;
		var row = table[left.type];
		var rules = row[right.type];

		pair.rules = rules;

		if (rules.pseudo)
			rules(left, right);
		else
			inqueue.push(pair);
	}
}

function encode(lval, rval, tree, wires, rt)
{
	var node = tree.node;
	var code = node.code;
	var agent = node.agent;
	var type = types[agent];
	var pax = tree.pax;
	var imgpax = [];
	var i;

	for (i = 0; i < pax.length; i++) {
		var sub = pax[i];

		imgpax[i] = encode(lval, rval, sub, wires, rt);
	}

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

			tree.type = wire.type;
			tree.main = wire.main;
			tree.aux = wire.aux;
		}

		delete tree.pax;

		wires[name] = tree;
	} else if (ambtype == type) {
		var wire = pax.shift();
		var twin = wire.twin;
		var main = pax.shift();
		var aux = pax.shift();

		wire.type = type;
		wire.main = main;
		wire.aux = aux;

		if (twin) {
			twin.type = type;
			twin.main = main;
			twin.aux = aux;
		}

		return wire;
	} else {
		var effect = mkeffect(lval, rval, code, true);

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
	var queue = [];
	var effect = mkeffect(0, 0, inverb);
	var i;

	effect.call(inenv);

	for (i = 0; i < inconf.length; i++) {
		var eqn = inconf[i];
		var left = eqn.left;
		var right = eqn.right;

		queue.push({
			left: encode(0, 0, left, wires, true),
			right: encode(0, 0, right, wires, true)
		});
	}

	flush(queue);
}

function prepare(mlc)
{
	var src = mlc2in(mlc);
	var system = parser.parse(src);

	inverb = system.code;
	inrules = system.rules;
	inconf = system.conf;
	inenv = {};
	inqueue = [];
	typelist = [];
	types = {
		wire: 0,
		amb: 1
	};
	ntypes = 2;
	nwires = 0;

	determ.pseudo = true;
	mreted.pseudo = true;
	rewire.pseudo = true;
	eriwer.pseudo = true;
	norule.pseudo = true;

	wiretype = types["wire"];
	ambtype = types["amb"];

	table = gettable();

	init();
}

function getlist(pax)
{
	var list = [];
	var i;

	for (i = 0; i < pax.length; i++)
		list[i] = gettree(pax[i]);

	if (list.length)
		return "(" + list.join(", ") + ")";
	else
		return "";
}

function format(data)
{
	if ("object" == typeof data)
		return obj2mlc(data);
	else if ("number" == typeof data)
		return data.toString();
	else
		return data;
}

function gettree(agent)
{
	var type = agent.type;
	var human;

	if (wiretype == type) {
		human = agent.human;

		if (!human) {
			++nwires;
			human = "w" + nwires;
			agent.human = human;
		}

		agent.twin.human = human;
	} else if (ambtype == type) {
		var index = agent.index;
		var list = "";

		if (!index || (nambs < index)) {
			++nambs;
			index = nambs;
			agent.twin.index = nambs;

			list = getlist([
				agent.main,
				agent.aux
			]);
		}

		human = "\\amb#" + index + list;
	} else {
		var data = format(agent.data);

		if (data)
			data = "_{" + data + "}";
		else
			data = "";

		type = typelist[type] + data;

		human = "\\" + type + getlist(agent.pax);
	}

	return human;
}

function geteqn(pair)
{
	var left = gettree(pair.left);
	var right = gettree(pair.right);

	return left + " = " + right + ";";
}

function getconf()
{
	var list = [];
	var i;

	nambs = 0;

	for (i = 0; i < inqueue.length; i++)
		list[i] = geteqn(inqueue[i]);

	return list.join("\n");
}

function debug()
{
	var conf = getconf();
	var pair;

	pair = inqueue.shift();
	if (pair)
		traverse(pair);

	return conf;
}

function getstats()
{
	var stats = {};
	var i;

	for (i = 0; i < table.length; i++) {
		var row = table[i];
		var j;

		for (j = 0; j < row.length; j++) {
			var cell = row[j];
			var k;

			if (cell.pseudo)
				continue;

			for (k = 0; k < cell.length; k++) {
				var rule = cell[k];
				var count = rule.count;
				var human = rule.human;

				if (!count)
					continue;

				human = human.split("><");
				human = human.sort();
				human = human.join("><");

				if (stats[human])
					stats[human] += count;
				else
					stats[human] = count;
			}
		}
	}

	return stats;
}

function run(mlc)
{
	prepare(mlc);

	reduce();

	inenv.stats = getstats();

	inenv.term = mlc2in.term;

	if (inenv.nf)
		inenv.nf = obj2mlc(inenv.nf);
	else
		inenv.nf = inenv.term;

	return inenv;
}

run.prepare = prepare;
run.debug = debug;
run.mlc2in = mlc2in;
run.example = example.replace(/\n*$/, "");
global.mlcjs = run;
