#!/usr/bin/env node

var lambda = require(".");
var yargs = require("yargs");
var fs = require("fs");

var opts = {
	debug: {
		alias: "d",
		desc: "Enable step-by-step evaluation",
		boolean: true
	},
	stats: {
		alias: "s",
		desc: "Save statistics to a file",
		string: true
	}
};

var argv = yargs
	.usage("Usage: $0 [options] <file.mlc>")
	.options(opts)
	.demandCommand(1)
	.help()
	.alias("help", "h")
	.version()
	.alias("version", "v")
	.strict()
	.wrap(70)
	.argv;

var input = fs.readFileSync(argv._[0], "utf8");

if (argv.debug) {
	var eqn;

	lambda.prepare(input);

	while (eqn = lambda.debug1())
		console.log(eqn);
} else {
	var output = lambda(input);
	var stats = JSON.stringify(output.stats, null, "\t");

	console.log(output.term);
	console.info("%s(%s)", output.total, output.beta);
	console.log(output.nf);

	if (argv.stats)
		fs.writeFileSync(argv.stats, stats + "\n");
}
