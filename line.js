"use strict";

const readline = require("readline");
const mlc = require("@alexo/lambda");
const fs = require("fs");

const rl = readline.createInterface({
	input: process.stdin
});
const argv = process.argv;
const limit = parseInt(argv.pop());
const algo = argv.pop();

rl.on("line", term => {
	let result;

	try {
		const output = mlc(term, algo, limit);
		const total = output.total;
		const beta = output.beta;
		const stats = `${total}/${beta}`;
		let nf = output.nf;

		if (!nf)
			nf = "?";

		result = `${stats}\t${nf}`;
	} catch (error) {
		result = `N/A\t${error}`;
	}

	fs.writeSync(1, `${term}\t${result}\n`);
});
