var mlc2in = require("./encode");
var inet = require("inet-lib");
var fs = require("fs");

var obj2mlc = mlc2in.obj2mlc;
var example = fs.readFileSync("fact.mlc", "utf8");

function format(data)
{
	if ("object" == typeof data)
		return obj2mlc(data);
	else if ("number" == typeof data)
		return data.toString();
	else
		return data;
}

function prepare(mlc)
{
	var src = mlc2in(mlc);

	inet.prepare(src, format);
}

function debug()
{
	return inet.debug();
}

function debug0()
{
	return inet.debug0();
}

function debug1()
{
	return inet.debug1();
}

function run(mlc)
{
	var src = mlc2in(mlc);
	var output = inet(src);

	output.term = mlc2in.term;

	if (output.nf)
		output.nf = obj2mlc(output.nf);
	else
		output.nf = output.term;

	return output;
}

run.prepare = prepare;
run.debug = debug;
run.debug0 = debug0;
run.debug1 = debug1;
run.mlc2in = mlc2in;
run.example = example.replace(/\n*$/, "");
global.mlcjs = run;
