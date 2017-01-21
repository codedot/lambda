#!/usr/bin/env node

var lambda = require(".");
var fs = require("fs");

var file = process.argv[2];

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
