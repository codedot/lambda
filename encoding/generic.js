"use strict";

const fs = require("fs");
const path = require("path");

const readback = fs.readFileSync(path.join(__dirname, "readback.txt"), "utf8");
let lastwire;

function getcap(left, right)
{
	const dict = {};

	for (const prop in left)
		if (prop in right)
			dict[prop] = left[prop];

	return dict;
}

function merge(left, right)
{
	const dict = {};

	for (const prop in left)
		dict[prop] = left[prop];

	for (const prop in right)
		dict[prop] = right[prop];

	return dict;
}

function getfv(obj)
{
	const node = obj.node;
	let fv;

	if ("atom" == node) {
		fv = {};

		if (!obj.free)
			fv[obj.name] = true;
	} else if ("abst" == node) {
		fv = getfv(obj.body);

		delete fv[obj.var];
	} else if ("appl" == node) {
		const left = getfv(obj.left);
		const right = getfv(obj.right);

		fv = merge(left, right);
	}

	return fv;
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
	const fvleft = getfv(left);
	const fvright = getfv(right);
	const shared = getcap(fvleft, fvright);
	const lmap = new Map();
	const rmap = new Map();
	const map = new Map();

	for (const atom in shared) {
		const wleft = mkwire();
		const wright = mkwire();

		map.set(atom, {
			left: wleft,
			right: wright
		});

		lmap.set(atom, wleft);
		rmap.set(atom, wright);
	}

	rename(left, lmap);
	rename(right, rmap);

	return map;
}

function alpha(obj, bv, lvl)
{
	const node = obj.node;
	const aobj = {
		node: node
	};

	if (!bv)
		bv = {};

	if (!lvl)
		lvl = 0;

	if ("atom" == node) {
		const name = obj.name;
		const id = bv[name];

		if (id) {
			aobj.name = id.name;
			aobj.index = lvl - id.lvl;
		} else {
			aobj.name = name;
			aobj.free = true;
		}
	} else if ("abst" == node) {
		const id = obj.var;
		const old = bv[id];
		const wire = mkwire();

		bv[id] = {
			name: wire,
			lvl: ++lvl
		};

		aobj.var = wire;
		aobj.body = alpha(obj.body, bv, lvl);

		if (old)
			bv[id] = old;
		else
			delete bv[id];
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

		if (!fv[id])
			continue;

		delete fv[id];
		fv = merge(fv, getfv(def));

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
	return alpha(term);
}

exports.expand = expand;
exports.mkwire = mkwire;
exports.mktwins = mktwins;
exports.getfv = obj => new Set(Object.keys(getfv(obj)));
exports.rename = rename;
exports.readback = readback;
