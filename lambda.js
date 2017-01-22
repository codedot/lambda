#!/usr/bin/env node

var lambda = require(".");
var yargs = require("yargs");
var fs = require("fs");

var opts = {
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

var argv = yargs
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

var input = argv._[0];

if (!argv.expr)
	input = fs.readFileSync(input, "utf8");

if (argv.debug) {
	var eqn;

	lambda.prepare(input);

	while (eqn = lambda.debug1())
		console.log(eqn);
} else {
	var output = lambda(input);
	var stats = JSON.stringify(output.stats, null, "\t");
	var total = output.total;
	var beta = output.beta;
	var redtime = output.redtime;

	console.log(output.term);
	console.info("%s(%s), %s ms", total, beta, redtime);
	console.log(output.nf);

	if (argv.stats)
		fs.writeFileSync(argv.stats, stats + "\n");
}
