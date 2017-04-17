"use strict";

const generic = require("./generic");
const abstract = require("./abstract");
const closed = require("./closed");
const hybrid = require("./hybrid");
const optimal = require("./optimal");

const expand = generic.expand;
const readback = generic.readback;

function addalgo(name, algo)
{
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

addalgo("abstract", abstract);
addalgo("closed", closed);
addalgo("hybrid", hybrid);
addalgo("optimal", optimal);
