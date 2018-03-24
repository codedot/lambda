"use strict";

const fs = require("fs");
const path = require("path");

const template = fs.readFileSync(path.join(__dirname, "template.txt"), "utf8");

let mkwire, mktwins, getfv, rename;

function box(fv, list, lvl)
{
	for (const atom in fv) {
		const ref = fv[atom].ref;
		const agent = `\\bra_{${lvl}}(${ref})`;

		list.push(`${atom} = ${agent}`);
	}
}

function psi(shared, list, lvl)
{
	shared.forEach((twins, atom) => {
		const left = twins.left;
		const right = twins.right;
		const agent = `\\fan_{${lvl}}`;
		const tree = `${agent}(${right}, ${left})`;

		list.push(`${atom} = ${tree}`);
	});
}

function gamma(obj, root, list, lvl)
{
	const node = obj.node;

	if ("atom" == node) {
		if (obj.free) {
			const name = `this.mkid(${obj.name})`;
			const agent = `\\atom_{${name}}`;

			list.push(`${root} = ${agent}`);
		} else {
			const agent = `\\cro_{${lvl}}(${root})`;

			list.push(`${obj.name} = ${agent}`);
		}
	} else if ("abst" == node) {
		const id = obj.var;
		const body = obj.body;
		const fv = getfv(body);
		const wire = mkwire();
		const agent = (id in fv) ? id : "\\erase";
		const tree = `\\lam_{${lvl}}(${agent}, ${wire})`;

		list.push(`${root} = ${tree}`);

		gamma(body, wire, list, lvl);
	} else if ("appl" == node) {
		const wleft = mkwire();
		const wright = mkwire();
		const left = obj.left;
		const right = obj.right;
		const shared = mktwins(left, right);
		const agent = `\\app_{${lvl}}`;
		const tree = `${agent}(${wright}, ${root})`;
		const fv = getfv(right);
		const map = new Map();

		for (const atom in fv) {
			const wref = mkwire();

			fv[atom] = {
				ref: wref
			};

			map.set(atom, wref);
		}

		rename(right, map);

		list.push(`${wleft} = ${tree}`);

		gamma(left, wleft, list, lvl);
		gamma(right, wright, list, lvl + 1);

		box(fv, list, lvl);
		psi(shared, list, lvl);
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
	rename = generic.rename;

	gamma(term, "root", inconfig, 0);

	inconfig.inet = template;
	return inconfig;
}

module.exports = encode;
