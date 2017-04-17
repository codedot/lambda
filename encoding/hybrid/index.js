"use strict";

const fs = require("fs");
const path = require("path");

const template = fs.readFileSync(path.join(__dirname, "template.txt"), "utf8");

let mkwire, bv;

function rho(id, list)
{
	bv[id].forEach(ref => {
		const wire = mkwire();

		list.push(`${id} = \\var(${wire}, ${ref})`);

		id = wire;
	});

	list.push(`${id} = \\nil`);
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
			const id = obj.name;

			bv[id].push(root);
		}
	} else if ("abst" == node) {
		const id = obj.var;
		const body = obj.body;
		const wire = mkwire();
		let tree = "\\lam(%s, %s)";

		tree = tree.replace("%s", id);
		tree = tree.replace("%s", wire);

		list.push(root + " = " + tree);

		bv[id] = [];

		gamma(body, wire, list);

		rho(id, list);
	} else if ("appl" == node) {
		const wleft = mkwire();
		const wright = mkwire();
		const left = obj.left;
		const right = obj.right;
		let agent = "\\app(%s, %s)";

		agent = agent.replace("%s", wright);
		agent = agent.replace("%s", root);

		list.push(wleft + " = " + agent);

		gamma(left, wleft, list);
		gamma(right, wright, list);
	}
}

function encode(generic, term)
{
	const inconfig = [
		"\\read_{this.mkhole()}(!print) = root"
	];

	mkwire = generic.mkwire;

	bv = {};
	gamma(term, "root", inconfig);

	inconfig.inet = template;
	return inconfig;
}

module.exports = encode;
