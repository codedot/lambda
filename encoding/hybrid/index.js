"use strict";

const fs = require("fs");
const path = require("path");

const template = fs.readFileSync(path.join(__dirname, "template.txt"), "utf8");

let mkwire, bv;

function rho(id, list, lvl)
{
	bv[id].forEach(entry => {
		const wire = entry.wire;
		const delta = entry.lvl - lvl - 1;
		const next = mkwire();
		const agent = `\\fan_{[${lvl}, ${delta}]}`;
		const tree = `${agent}(${next}, ${wire})`;

		list.push(`${id} = ${tree}`);

		id = next;
	});

	list.push(`${id} = \\nil`);
}

function gamma(obj, root, list, lvl)
{
	const node = obj.node;

	if ("atom" == node) {
		if (obj.free) {
			const name = `this.mkid("${obj.name}")`;
			const agent = `\\atom_{${name}}`;

			list.push(`${root} = ${agent}`);
		} else {
			const id = obj.name;

			bv[id].push({
				lvl: lvl,
				wire: root
			});
		}
	} else if ("abst" == node) {
		const id = obj.var;
		const body = obj.body;
		const wire = mkwire();
		const agent = `\\lam_{${lvl}}`;
		const tree = `${agent}(${id}, ${wire})`;

		list.push(`${root} = ${tree}`);

		bv[id] = [];

		gamma(body, wire, list, lvl);

		rho(id, list, lvl);
	} else if ("appl" == node) {
		const wleft = mkwire();
		const wright = mkwire();
		const left = obj.left;
		const right = obj.right;
		const agent = `\\app_{${lvl}}`;
		const tree = `${agent}(${wright}, ${root})`;

		list.push(`${wleft} = ${tree}`);

		gamma(left, wleft, list, lvl);
		gamma(right, wright, list, lvl + 1);
	}
}

function encode(generic, term)
{
	const inconfig = [
		"\\read_{this.mkhole()}(!print) = root"
	];

	mkwire = generic.mkwire;

	bv = {};
	gamma(term, "root", inconfig, 0);

	inconfig.inet = template;
	return inconfig;
}

module.exports = encode;
