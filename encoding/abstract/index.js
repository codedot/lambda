"use strict";

const fs = require("fs");
const path = require("path");

const template = fs.readFileSync(path.join(__dirname, "template.txt"), "utf8");

let mkwire, mktwins, getfv;

function psi(shared, list)
{
	shared.forEach((twins, atom) => {
		const left = twins.left;
		const right = twins.right;
		const agent = `\\fanin_{this.uniq()}`;
		const tree = `${agent}(${right}, ${left})`;

		list.push(`${atom} = ${tree}`);
	});
}

function gamma(obj, root, list)
{
	const node = obj.node;

	if ("atom" == node) {
		if (obj.free) {
			const name = `this.mkid("${obj.name}")`;
			const agent = `\\atom_{${name}}`;

			list.push(`${root} = ${agent}`);
		} else {
			const name = obj.name;

			list.push(`${root} = ${name}`);
		}
	} else if ("abst" == node) {
		const id = obj.bound;
		const body = obj.body;
		const fv = getfv(body);
		const wire = mkwire();
		const agent = fv.has(id) ? id : "\\erase";
		const tree = `\\lambda(${agent}, ${wire})`;

		list.push(`${root} = ${tree}`);

		gamma(body, wire, list);
	} else if ("appl" == node) {
		const wleft = mkwire();
		const wright = mkwire();
		const left = obj.left;
		const right = obj.right;
		const shared = mktwins(left, right);
		const agent = `\\apply(${wright}, ${root})`;

		list.push(`${wleft} = ${agent}`);

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

	gamma(term, "root", inconfig);

	inconfig.inet = template;
	return inconfig;
}

module.exports = encode;
