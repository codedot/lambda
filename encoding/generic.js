"use strict";

const fs = require("fs");
const path = require("path");

const readback = fs.readFileSync(path.join(__dirname, "readback.txt"), "utf8");
let lastwire;

function getcap(left, right)
{
	const cap = new Set();

	left = getfv(left);
	right = getfv(right);

	left.forEach(atom => {
		if (right.has(atom))
			cap.add(atom);
	});

	return cap;
}

function merge(left, right)
{
	left = Array.from(left);
	right = Array.from(right);
	return new Set(left.concat(right));
}

function getfv(obj)
{
	const node = obj.node;

	if ("atom" == node) {
		const fv = new Set();

		if (!obj.free)
			fv.add(obj.name);

		return fv;
	}

	if ("abst" == node) {
		const fv = getfv(obj.body);

		fv.delete(obj.var);

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

	getcap(left, right).forEach(atom => {
		const wleft = mkwire();
		const wright = mkwire();

		lmap.set(atom, wleft);
		rmap.set(atom, wright);
		smap.set(atom, {
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
			aobj.name = id.name;
			aobj.index = lvl - id.lvl;
		} else {
			aobj.name = name;
			aobj.free = true;
		}
	} else if ("abst" == node) {
		const id = obj.var;
		const old = bv.get(id);
		const wire = mkwire();

		bv.set(id, {
			name: wire,
			lvl: ++lvl
		});

		aobj.var = wire;
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
	const macros = dict.macros;
	const mlen = macros.length;
	let term = dict.term;
	let fv = getfv(term);

	for (let i = 0; i < mlen; i++) {
		const macro = macros[i];
		const id = macro.id;
		const def = macro.def;

		if (!fv.has(id))
			continue;

		fv.delete(id);

		getfv(def).forEach(atom => {
			fv.add(atom);
		});

		term = {
			node: "appl",
			left: {
				node: "abst",
				var: id,
				body: term
			},
			right: def
		};
	}

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
