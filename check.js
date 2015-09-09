require("./bundle");
var fs = require("fs");

var file = process.argv[2];

if (file) {
	var input = fs.readFileSync(file, "utf8");
	var conf;

	mlcjs.prepare(input);

	while (conf = mlcjs.debug())
		console.log("$$\n%s", conf);

	console.log("$$");
} else {
	var output = mlcjs(mlcjs.example);

	console.log(output.term);
	console.info("%s(%s)", output.total, output.beta);
	console.log(output.nf);
}
