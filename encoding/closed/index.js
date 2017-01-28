"use strict";

const generic = require("../generic");
const fs = require("fs");
const path = require("path");

const system = fs.readFileSync(path.join(__dirname, "template.txt"), "utf8");
const expand = generic.expand;
const mkwire = generic.mkwire;
const mktwins = generic.mktwins;
const getfv = generic.getfv;
const subst = generic.subst;

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

function rho(fv, root, end, list)
{
	for (const atom in fv) {
		const ref = fv[atom].ref;
		const next = mkwire();
		let head = "%s = \\bind(%s, %s, %s)";

		head = head.replace("%s", atom);
		head = head.replace("%s", next);
		head = head.replace("%s", ref);
		head = head.replace("%s", root);

		list.push(head);

		root = next;
	}

	list.push(root + " = " + end);
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

		delete fv[id];

		for (const atom in fv) {
			var wref = mkwire();

			fv[atom] = {
				ref: wref
			};
		}

		subst(body, fv, "ref");

		rho(fv, root, tree, list);
		gamma(body, wire, list);
	} else if ("appl" == node) {
		const wleft = mkwire();
		const wright = mkwire();
		const left = obj.left;
		const right = obj.right;
		const shared = mktwins(left, right);
		let agent = "\\outapp(%s, %s)";

		agent = agent.replace("%s", wleft);
		agent = agent.replace("%s", wright);

		list.push(root + " = " + agent);

		gamma(left, wleft, list);
		gamma(right, wright, list);
		psi(shared, list);
	}
}

function encode(term)
{
	let inconfig = [
		"\\read_{this.mkhole()}(\\print) = root"
	];

	gamma(expand(term), "root", inconfig);
	inconfig = inconfig.join(";\n") + ";";

	return system.replace("INCONFIG", inconfig);
}

module.exports = encode;
