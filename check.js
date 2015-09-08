require("./bundle");
var fs = require("fs");

var file = process.argv[2];
var input = file ? fs.readFileSync(file, "utf8") : mlcjs.example;
var output = mlcjs(input);

console.log(output.term);
console.info("%s(%s)", output.total, output.beta);
console.log(output.nf);
