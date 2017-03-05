"use strict";

const generic = require("../generic");
const fs = require("fs");
const path = require("path");

const template = fs.readFileSync(path.join(__dirname, "template.txt"), "utf8");
const mkwire = generic.mkwire;
const mktwins = generic.mktwins;
const getfv = generic.getfv;

function psi(shared, list)
{
	for (const atom in shared) {
		const twins = shared[atom];
		const wleft = twins.left;
		const wright = twins.right;
		const wire = mkwire();
		let eqn = "%s = \\amb(%s, \\share(%s, %s), %s)";

		eqn = eqn.replace("%s", wleft);
		eqn = eqn.replace("%s", wright);
		eqn = eqn.replace("%s", atom);
		eqn = eqn.replace("%s", wire);
		eqn = eqn.replace("%s", wire);

		list.push(eqn);
	}
}

function gamma(obj, root, list)
{
	const node = obj.node;

	if ("atom" == node) {
		let agent = "\\atom_{this.mkid(\"%s\")}";

		if (obj.free)
			agent = agent.replace("%s", obj.name);
		else
			agent = obj.name;

		list.push(root + " = " + agent);
	} else if ("abst" == node) {
		const id = obj.var;
		const body = obj.body;
		const fv = getfv(body);
		const wire = mkwire();
		let tree = "\\lambda(%s, %s)";
		let agent;

		if (id in fv)
			agent = id;
		else
			agent = "\\erase";

		tree = tree.replace("%s", agent);
		tree = tree.replace("%s", wire);

		list.push(root + " = " + tree);

		gamma(body, wire, list);
	} else if ("appl" == node) {
		const wleft = mkwire();
		const wright = mkwire();
		const left = obj.left;
		const right = obj.right;
		const shared = mktwins(left, right);
		let agent = "\\apply(%s, %s)";

		agent = agent.replace("%s", wleft);
		agent = agent.replace("%s", wright);

		list.push(root + " = " + agent);

		gamma(left, wleft, list);
		gamma(right, wright, list);
		psi(shared, list);
	}
}

function encode(generic, term)
{
	const inconfig = [
		"\\read_{this.mkhole()}(\\print) = root"
	];

	gamma(term, "root", inconfig);

	inconfig.inet = template;
	return inconfig;
}

module.exports = encode;
