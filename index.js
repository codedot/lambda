"use strict";

const encoding = require("./encoding");
const compile = require("./compile");
const inet = require("inet-lib");

const parser = new compile.Parser();
const defalgo = "abstract";
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

		return obj.bound + sep + obj2mlc(body);
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

function mlc2in(mlc, algo, cb)
{
	const encode = encoding.get(algo ? algo : defalgo);
	let insrc;

	if (!encode)
		throw `${algo}: Unknown algorithm`;

	mlc = parser.parse(mlc);
	insrc = encode(mlc);
	expanded = mlc.expanded;
	inet.inenv = {
		cb: cb
	};

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

function prepare(mlc, algo)
{
	const src = mlc2in(mlc, algo);

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

function run(mlc, algo, max, cb)
{
	const src = mlc2in(mlc, algo, cb);
	const output = inet(src, max);

	output.term = obj2mlc(expanded);

	if (output.nf)
		output.nf = obj2mlc(output.nf);

	return output;
}

run.defalgo = defalgo;
run.algos = Array.from(encoding.keys());
run.prepare = prepare;
run.debug = debug;
run.debug0 = debug0;
run.debug1 = debug1;
run.mlc2in = mlc2in;

module.exports = run;
