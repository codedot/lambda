#!/usr/bin/env node

"use strict";

const lambda = require(".");
const yargs = require("yargs");
const fs = require("fs");
const path = require("path");

const helper = path.join(__dirname, "helper.txt");

const opts = {
	algo: {
		alias: "a",
		desc: "Select algorithm",
		string: true
	},
	debug: {
		alias: "d",
		desc: "Evaluate step by step",
		boolean: true
	},
	exec: {
		alias: "e",
		desc: "Process m4(1) macros",
		boolean: true
	},
	file: {
		alias: "f",
		desc: "Read term from file",
		boolean: true
	},
	inet: {
		alias: "i",
		desc: "Show interaction net",
		boolean: true
	},
	limit: {
		alias: "l",
		desc: "Limit interactions",
		number: true
	},
	macros: {
		alias: "m",
		desc: "Read macros from file",
		string: true
	},
	perf: {
		alias: "p",
		desc: "Print benchmarks",
		boolean: true
	},
	stats: {
		alias: "s",
		desc: "Save statistics to file",
		string: true
	},
	term: {
		alias: "t",
		desc: "Output expanded term",
		boolean: true
	}
};

const argv = yargs
	.usage("Usage: $0 [options] (<term> | -f <file>)")
	.options(opts)
	.demandCommand(1, 1)
	.help()
	.alias("help", "h")
	.version()
	.alias("version", "v")
	.strict()
	.wrap(50)
	.argv;

const macros = argv.macros ? argv.macros : helper;
const comb = fs.readFileSync(macros, "utf8");

let input = argv._[0];

if (argv.file)
	input = fs.readFileSync(input, "utf8");

input = comb.concat(input);

if (argv.exec) {
	const exec = require("child_process").execSync;

	input = exec("m4", {
		encoding: "utf8",
		input: input
	});
}

if (argv.debug) {
	let eqn;

	lambda.prepare(input, argv.algo);

	while (eqn = lambda.debug1())
		console.info(eqn);
} else if (argv.inet) {
	const inet = lambda.mlc2in(input, argv.algo);

	process.stdout.write(inet);
} else {
	const output = lambda(input, argv.algo, argv.limit);
	const stats = JSON.stringify(output.stats, null, "\t");
	const total = output.total;
	const beta = output.beta;
	const redtime = output.redtime;

	if (argv.term)
		console.warn(output.term);

	if (argv.perf)
		console.warn(`${total}(${beta}), ${redtime} ms`);

	if (argv.stats)
		fs.writeFileSync(argv.stats, stats + "\n");

	if (output.nf)
		console.info(output.nf);
	else
		process.exit(1);
}
