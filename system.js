var mlc2in = require("./encode");
var inet = require("./agents");
var fs = require("fs");

var example = fs.readFileSync("fact.mlc", "utf8");
var parser = new inet.Parser();
var inverb, inrules, inconf, inenv, inqueue;
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

function deadlock(lagent, ragent)
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

	if (wire.type != wiretype)
		return addpair(wire, agent);

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

	if (amb.type != ambtype)
		return addpair(amb, agent);

	addpair(main, agent);

	wire.type = wiretype;
	delete wire.main;
	delete wire.aux;
	twin.type = wiretype;
	delete twin.main;
	delete twin.aux;
	addpair(wire, aux);
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
	else
		code = code + "\n\treturn true;";

	return new Function("LVAL", "RVAL", code);
}

function apply(left, right, code, rl)
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
		var wcopy, lpax, rpax, lval, rval, context;

		if (rl) {
			rval = lagent.data;
			lval = ragent.data;
		} else {
			lval = lagent.data;
			rval = ragent.data;
		}

		if (!effect.call(inenv, lval, rval))
			return true;

		wcopy = cpwlist(wlist);
		lpax = lagent.pax;
		rpax = ragent.pax;

		context = {
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
	}

	interact.human = human;

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
					rules = [rewire];
				else if ("wire" == right)
					rules = [eriwer];
				else if ("amb" == left)
					rules = [determ];
				else if ("amb" == right)
					rules = [mreted];
				else
					rules = [];
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
	var rules = pair.rules;
	var i;

	for (i = 0; i < rules.length; i++) {
		var rule = rules[i];
		var next = rule(pair.left, pair.right);

		if (!next)
			return;
	}

	deadlock(pair.left, pair.right);
}

function reduce()
{
	var pair;

	while (pair = inqueue.shift())
		traverse(pair);
}

function addpair(left, right)
{
	var row = table[left.type];
	var cell = row[right.type];

	inqueue.push({
		rules: cell,
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

	effect.call(inenv);

	for (i = 0; i < inconf.length; i++) {
		var eqn = inconf[i];
		var left = eqn.left;
		var right = eqn.right;

		left = encode(left, wires, true);
		right = encode(right, wires, true);
		addpair(left, right);
	}
}

function run(mlc)
{
	var src = mlc2in(mlc);
	var system = parser.parse(src);

	inverb = system.code;
	inrules = system.rules;
	inconf = system.conf;
	inenv = {
		term: mlc2in.term,
		obj2mlc: mlc2in.obj2mlc
	};
	inqueue = [];
	typelist = [];
	types = {
		wire: 0,
		amb: 1
	};
	ntypes = 2;

	deadlock.human = "dead>!<lock";

	determ.human = "amb><_";
	mreted.human = "_><amb";

	rewire.human = "wire><_";
	eriwer.human = "_><wire";

	wiretype = types["wire"];
	ambtype = types["amb"];

	table = gettable();

	init();

	reduce();

	if (inenv.nf)
		inenv.nf = mlc2in.obj2mlc(inenv.nf);
	else
		inenv.nf = inenv.term;

	return inenv;
}

run.mlc2in = mlc2in;
run.example = example.replace(/\n*$/, "");
global.mlcjs = run;
