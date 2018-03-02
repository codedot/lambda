"use strict";

const exhaust = require("./exhaust");
const mlc = require("@alexo/lambda");
const fs = require("fs");

const argv = process.argv;
const max = parseInt(argv.pop());
const min = parseInt(argv.pop());
const limit = parseInt(argv.pop());
const algo = argv.pop();

for (const term of exhaust(min, max)) {
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
}
