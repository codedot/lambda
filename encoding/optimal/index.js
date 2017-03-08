"use strict";

const fs = require("fs");
const path = require("path");

const template = fs.readFileSync(path.join(__dirname, "template.txt"), "utf8");

let mkwire, mktwins, getfv;

function psi(shared, list)
{
	for (const atom in shared) {
		const twins = shared[atom];
		const wleft = twins.left;
		const wright = twins.right;
		let eqn = "%s = \\fan_{0}(%s, %s)";

		eqn = eqn.replace("%s", atom);
		eqn = eqn.replace("%s", wright);
		eqn = eqn.replace("%s", wleft);

		list.push(eqn);
	}
}

function mkscope(n)
{
	let s = "%s";

	for (let i = 0; i < n; i++)
		s = "\\scope_{0}(" + s + ")";

	return s;
}

function gamma(obj, root, list)
{
	const node = obj.node;

	if ("atom" == node) {
		if (obj.free) {
			let agent = "\\atom_{this.mkid(\"%s\")}";

			agent = agent.replace("%s", obj.name);

			list.push(root + " = " + agent);
		} else {
			let agent = mkscope(obj.index);

			agent = agent.replace("%s", root);

			list.push(obj.name + " = " + agent);
		}
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

		agent = agent.replace("%s", wright);
		agent = agent.replace("%s", root);

		list.push(wleft + " = " + agent);

		gamma(left, wleft, list);
		gamma(right, wright, list);
		psi(shared, list);
	}
}

function encode(generic, term)
{
	const inconfig = [
		"\\eval(\\read_{this.mkhole()}(!print)) = root"
	];

	mkwire = generic.mkwire;
	mktwins = generic.mktwins;
	getfv = generic.getfv;

	gamma(term, "root", inconfig);

	inconfig.inet = template;
	return inconfig;
}

module.exports = encode;
