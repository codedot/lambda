"use strict";

const fs = require("fs");
const path = require("path");

const readback = fs.readFileSync(path.join(__dirname, "readback.txt"), "utf8");
let lastwire;

function getcap(left, right)
{
	const cap = new Map();

	left = getfv(left);
	right = getfv(right);

	left.forEach((proper, atom) => {
		if (right.has(atom))
			cap.set(atom, proper);
	});

	return cap;
}

function merge(left, right)
{
	left = Array.from(left);
	right = Array.from(right);
	return new Map(left.concat(right));
}

function getfv(obj)
{
	const node = obj.node;

	if ("atom" == node) {
		const fv = new Map();

		if (!obj.free)
			fv.set(obj.name, obj.proper);

		return fv;
	}

	if ("abst" == node) {
		const fv = getfv(obj.body);

		fv.delete(obj.bound);

		return fv;
	}

	if ("appl" == node) {
		const left = getfv(obj.left);
		const right = getfv(obj.right);

		return merge(left, right);
	}
}

function mkwire()
{
	++lastwire;
	return "w" + lastwire.toFixed(0);
}

function rename(obj, map)
{
	const node = obj.node;

	if ("atom" == node) {
		const name = obj.name;

		if (map.has(name))
			obj.name = map.get(name);
	} else if ("abst" == node) {
		const body = obj.body;

		rename(body, map);
	} else if ("appl" == node) {
		rename(obj.left, map);
		rename(obj.right, map);
	}
}

function mktwins(left, right)
{
	const lmap = new Map();
	const rmap = new Map();
	const smap = new Map();

	getcap(left, right).forEach((proper, atom) => {
		const wleft = mkwire();
		const wright = mkwire();

		lmap.set(atom, wleft);
		rmap.set(atom, wright);
		smap.set(atom, {
			proper: proper,
			left: wleft,
			right: wright
		});
	});

	rename(left, lmap);
	rename(right, rmap);
	return smap;
}

function alpha(obj, bv, lvl)
{
	const node = obj.node;
	const aobj = {
		node: node
	};

	if ("atom" == node) {
		const name = obj.name;
		const id = bv.get(name);

		if (id) {
			const proper = id.name;

			aobj.name = proper;
			aobj.proper = proper;
			aobj.index = lvl - id.lvl;
		} else {
			aobj.name = name;
			aobj.free = true;
		}
	} else if ("abst" == node) {
		const id = obj.bound;
		const old = bv.get(id);
		const wire = mkwire();

		bv.set(id, {
			name: wire,
			lvl: ++lvl
		});

		aobj.bound = wire;
		aobj.body = alpha(obj.body, bv, lvl);

		if (old)
			bv.set(id, old);
		else
			bv.delete(id);
	} else if ("appl" == node) {
		aobj.left = alpha(obj.left, bv, lvl);
		aobj.right = alpha(obj.right, bv, lvl);
	}

	return aobj;
}

function expand(dict)
{
	const orig = dict.term;
	const term = dict.macros.reduce((acc, macro) => {
		const fv = acc.fv;
		const id = macro.id;
		const def = macro.def;

		if (!fv.has(id))
			return acc;

		fv.delete(id);

		getfv(def).forEach((proper, atom) => {
			fv.set(atom, proper);
		});

		acc.term = {
			node: "appl",
			left: {
				node: "abst",
				bound: id,
				body: acc.term
			},
			right: def
		};
		return acc;
	}, {
		term: orig,
		fv: getfv(orig)
	}).term;

	dict.expanded = term;
	lastwire = 0;
	return alpha(term, new Map(), 0);
}

exports.expand = expand;
exports.mkwire = mkwire;
exports.mktwins = mktwins;
exports.getfv = getfv;
exports.rename = rename;
exports.readback = readback;
