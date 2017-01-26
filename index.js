"use strict";

const encode = require("./encode");
const compile = require("./compile");
const inet = require("inet-lib");
const fs = require("fs");
const path = require("path");

const parser = new compile.Parser();
const example = fs.readFileSync(path.join(__dirname, "fact.mlc"), "utf8");
let expanded;

function obj2mlc(obj)
{
	const node = obj.node;

	if ("atom" == node)
		return obj.name;

	if ("abst" == node) {
		const body = obj.body;
		let sep;

		if ("abst" == body.node)
			sep = ", ";
		else
			sep = ": ";

		return obj.var + sep + obj2mlc(body);
	}

	if ("appl" == node) {
		const left = obj.left;
		const right = obj.right;
		const rnode = right.node;
		let lmlc = obj2mlc(left);
		let rmlc = obj2mlc(right);

		if ("abst" == left.node)
			lmlc = "(" + lmlc + ")";

		if (("abst" == rnode) || ("appl" == rnode))
			rmlc = "(" + rmlc + ")";

		return lmlc + " " + rmlc;
	}

	return "[ ]";
}

function mlc2in(mlc)
{
	const dict = parser.parse(mlc);
	const insrc = encode(dict);

	expanded = dict.expanded;

	return insrc;
}

function format(data)
{
	if (Array.isArray(data))
		return data.toString();
	else if ("object" == typeof data)
		return obj2mlc(data);
	else if ("number" == typeof data)
		return data.toString();
	else
		return data;
}

function prepare(mlc)
{
	const src = mlc2in(mlc);

	inet.prepare(src, format);
}

function debug()
{
	return inet.debug();
}

function debug0()
{
	return inet.debug0();
}

function debug1()
{
	return inet.debug1();
}

function run(mlc)
{
	const src = mlc2in(mlc);
	const output = inet(src);

	output.term = obj2mlc(expanded);

	if (output.nf)
		output.nf = obj2mlc(output.nf);
	else
		output.nf = output.term;

	return output;
}

run.prepare = prepare;
run.debug = debug;
run.debug0 = debug0;
run.debug1 = debug1;
run.mlc2in = mlc2in;
run.example = example.replace(/\n*$/, "");

module.exports = run;
