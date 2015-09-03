require("./bundle");

var output = mlcjs(mlcjs.example);

console.log(output.term);
console.info("%s(%s)", output.total, output.beta);
console.log(output.nf);
