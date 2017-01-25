#!/usr/bin/env node

"use strict";

const lambda = require(".");
const yargs = require("yargs");
const path = require("path");
const fs = require("fs");

const opts = {
	comb: {
		alias: "c",
		desc: "Predefine commonly used combinators",
		boolean: true
	},
	term: {
		alias: "t",
		desc: "Output the term being evaluated",
		boolean: true
	},
	perf: {
		alias: "p",
		desc: "Print benchmarks",
		boolean: true
	},
	expr: {
		alias: "e",
		desc: "Process the argument as expression",
		boolean: true
	},
	debug: {
		alias: "d",
		desc: "Enable step-by-step evaluation",
		boolean: true
	},
	stats: {
		alias: "s",
		desc: "Write statistics to a file",
		string: true
	}
};

const argv = yargs
	.usage("Usage: $0 [options] (<file> | -e <expr>)")
	.options(opts)
	.demandCommand(1)
	.help()
	.alias("help", "h")
	.version()
	.alias("version", "v")
	.strict()
	.wrap(70)
	.argv;

const comb = fs.readFileSync(path.join(__dirname, "helper.txt"), "utf8");

let input = argv._[0];

if (!argv.expr)
	input = fs.readFileSync(input, "utf8");

if (argv.comb)
	input = comb.concat(input);

if (argv.debug) {
	let eqn;

	lambda.prepare(input);

	while (eqn = lambda.debug1())
		console.info(eqn);
} else {
	const output = lambda(input);
	const stats = JSON.stringify(output.stats, null, "\t");
	const total = output.total;
	const beta = output.beta;
	const redtime = output.redtime;

	if (argv.term)
		console.warn(output.term);

	if (argv.perf)
		console.warn(`${total}(${beta}), ${redtime} ms`);

	console.info(output.nf);

	if (argv.stats)
		fs.writeFileSync(argv.stats, stats + "\n");
}
