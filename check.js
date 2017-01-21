var mlcjs = require("./system");
var fs = require("fs");

var file = process.argv[2];

if (file) {
	var input = fs.readFileSync(file, "utf8");
	var eqn;

	mlcjs.prepare(input);

	while (eqn = mlcjs.debug1())
		console.log(eqn);
} else {
	var output = mlcjs(mlcjs.example);
	var stats = JSON.stringify(output.stats, null, "\t");

	console.log(output.term);
	console.info("%s(%s)", output.total, output.beta);
	console.log(output.nf);

	fs.writeFileSync("profile.json", stats + "\n");
}
