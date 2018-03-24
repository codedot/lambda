"use strict";

const generic = require("./generic");
const abstract = require("./abstract");
const closed = require("./closed");
const optimal = require("./optimal");
const standard = require("./standard");

const map = new Map();
const expand = generic.expand;
const readback = generic.readback;
const encode = algo => term => {
	const expanded = expand(term);
	const eqns = algo(generic, expanded);
	const conf = eqns.join(";\n") + ";";
	let inet = eqns.inet;

	inet = inet.replace("INCONFIG", conf);
	inet = inet.replace("READBACK\n", readback);
	return inet;
};

map.set("abstract", encode(abstract));
map.set("closed", encode(closed));
map.set("optimal", encode(optimal));
map.set("standard", encode(standard));

module.exports = map;
