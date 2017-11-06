"use strict";

const fs = require("fs");
const path = require("path");

const template = fs.readFileSync(path.join(__dirname, "template.txt"), "utf8");

let mkwire, mktwins, getfv, subst;

function psi(shared, list)
{
	for (const atom in shared) {
		const twins = shared[atom];
		const left = twins.left;
		const right = twins.right;
		const wire = mkwire();
		const agent = `\\share(${atom}, ${wire})`;
		const amb = `\\amb(${right}, ${agent}, ${wire})`;

		list.push(`${left} = ${amb}`);
	}
}

function rho(fv, root, end, list)
{
	for (const atom in fv) {
		const ref = fv[atom].ref;
		const next = mkwire();
		const agent = `\\bind(${next}, ${ref}, ${root})`;

		list.push(`${atom} = ${agent}`);

		root = next;
	}

	list.push(`${root} = ${end}`);
}

function gamma(obj, root, list)
{
	const node = obj.node;

	if ("atom" == node) {
		if (obj.free) {
			const name = `this.mkid(${obj.name})`;
			const agent = `\\atom_{${name}}`;

			list.push(`${root} = ${agent}`);
		} else {
			const name = obj.name;

			list.push(`${root} = ${name}`);
		}
	} else if ("abst" == node) {
		const id = obj.var;
		const body = obj.body;
		const fv = getfv(body);
		const wire = mkwire();
		const agent = (id in fv) ? id : "\\erase";
		const tree = `\\lambda(${agent}, ${wire})`;

		delete fv[id];

		for (const atom in fv) {
			const wref = mkwire();

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
		const agent = `\\outapp(${wleft}, ${wright})`;

		list.push(`${root} = ${agent}`);

		gamma(left, wleft, list);
		gamma(right, wright, list);

		psi(shared, list);
	}
}

function encode(generic, term)
{
	const inconfig = [
		"\\read_{this.mkhole()}(!print) = root"
	];

	mkwire = generic.mkwire;
	mktwins = generic.mktwins;
	getfv = generic.getfv;
	subst = generic.subst;

	gamma(term, "root", inconfig);

	inconfig.inet = template;
	return inconfig;
}

module.exports = encode;
