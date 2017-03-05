"use strict";

const generic = require("./generic");

const expand = generic.expand;
const readback = generic.readback;

function addalgo(name)
{
	const algo = require("./" + name);

	function encode(term)
	{
		let conf, inet;

		term = expand(term);
		conf = algo(generic, term);
		inet = conf.inet;

		conf = conf.join(";\n")  + ";";
		inet = inet.replace("INCONFIG", conf);
		inet = inet.replace("READBACK\n", readback);
		return inet;
	}

	exports[name] = encode;
}

addalgo("abstract");
addalgo("closed");
addalgo("normal");
addalgo("optimal");
addalgo("turning");
