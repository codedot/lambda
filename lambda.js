#!/usr/bin/env node

var lambda = require(".");
var yargs = require("yargs");
var fs = require("fs");

var argv = yargs
	.usage("Usage: $0 [file]")
	.help()
	.alias("help", "h")
	.version()
	.alias("version", "v")
	.strict()
	.wrap(70)
	.argv;

var file = argv._[0];

if (file) {
	var input = fs.readFileSync(file, "utf8");
	var eqn;

	lambda.prepare(input);

	while (eqn = lambda.debug1())
		console.log(eqn);
} else {
	var output = lambda(lambda.example);
	var stats = JSON.stringify(output.stats, null, "\t");

	console.log(output.term);
	console.info("%s(%s)", output.total, output.beta);
	console.log(output.nf);

	fs.writeFileSync("stats.json", stats + "\n");
}
