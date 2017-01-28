"use strict";

const generic = require("../generic");
const fs = require("fs");
const path = require("path");

const system = fs.readFileSync(path.join(__dirname, "template.txt"), "utf8");
const expand = generic.expand;
const mkwire = generic.mkwire;
const mktwins = generic.mktwins;
const getfv = generic.getfv;

function psi(shared)
{
	var list = [];
	var template = "%s = \\fan_{this.uniq()}(%s, %s)";
	var atom;

	for (atom in shared) {
		var twins = shared[atom];
		var wleft = twins.left;
		var wright = twins.right;
		var eqn = template;

		eqn = eqn.replace("%s", atom);
		eqn = eqn.replace("%s", wright);
		eqn = eqn.replace("%s", wleft);

		list.push(eqn);
	}

	return list;
}

function gamma(obj, root)
{
	var list = [];
	var node = obj.node;

	if ("atom" == node) {
		if (obj.free) {
			var agent = "\\atom_{this.mkid(\"%s\")}";

			agent = agent.replace("%s", obj.name);
			list.push(root + " = " + agent);
		} else {
			var agent = "%s";

			agent = agent.replace("%s", root);
			list.push(obj.name + " = " + agent);
		}
	} else if ("abst" == node) {
		var tree = "\\lambda(%s, %s)";
		var body = obj.body;
		var fv = getfv(body);
		var id = obj.var;
		var wire = mkwire();

		if (id in fv)
			agent = id;
		else
			agent = "\\erase";

		tree = tree.replace("%s", agent);
		tree = tree.replace("%s", wire);
		list.push(root + " = " + tree);

		body = gamma(body, wire);
		list = list.concat(body);
	} else if ("appl" == node) {
		var wleft = mkwire();
		var wright = mkwire();
		var agent = "\\apply(%s, %s)";
		var left = obj.left;
		var right = obj.right;
		var shared = mktwins(left, right);

		agent = agent.replace("%s", wright);
		agent = agent.replace("%s", root);
		list.push(wleft + " = " + agent);

		left = gamma(left, wleft);
		right = gamma(right, wright);
		shared = psi(shared);
		list = list.concat(left, right, shared);
	}

	return list;
}

function encode(term)
{
	let inconfig = [
		"\\eval(\\read_{this.mkhole()}(\\print)) = root"
	];

	gamma(expand(term), "root", inconfig);
	inconfig = inconfig.join(";\n") + ";";

	return system.replace("INCONFIG", inconfig);
}

module.exports = encode;
